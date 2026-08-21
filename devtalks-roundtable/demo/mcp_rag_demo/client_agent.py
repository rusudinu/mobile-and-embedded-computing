"""MCP + RAG demo client.

The story:

- An MCP server (`server.py`, spawned here as a stdio subprocess) owns the
  in-memory Chroma index and the embedding model. It advertises one tool,
  `search_knowledge(query, k)`.
- This client talks to LM Studio over the OpenAI-compatible Chat
  Completions API, advertises the server's tools to the model using the
  `tools=[...]` parameter, and runs whichever tool the model picks via
  MCP.
- In `--fallback` mode, the client instead always calls `search_knowledge`
  once *before* talking to the LLM and passes the retrieved passages as
  plain context. This path does not depend on tool-calling support in the
  loaded chat model.

Run:
    uv run client_agent.py                                    # agentic
    uv run client_agent.py -q "Why combine MCP with RAG?"     # agentic
    uv run client_agent.py --fallback                         # non-agentic
"""

from __future__ import annotations

import argparse
import asyncio
import json
import shutil
import sys
from pathlib import Path
from typing import Any

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client
from openai import OpenAI

from config import Config, load_config

SERVER_SCRIPT = Path(__file__).parent / "server.py"
DEFAULT_QUESTION = (
    "What is DevTalks (per the knowledge base) and how does MCP relate to RAG in this demo?"
)


def _server_params() -> StdioServerParameters:
    uv_path = shutil.which("uv") or "uv"
    return StdioServerParameters(
        command=uv_path,
        args=["run", str(SERVER_SCRIPT.name)],
        cwd=str(SERVER_SCRIPT.parent),
    )


def _tool_result_to_text(result: Any) -> str:
    parts: list[str] = []
    for item in result.content:
        text = getattr(item, "text", None)
        parts.append(text if text is not None else str(item))
    return "\n".join(parts).strip()


def _mcp_tools_to_openai_schema(tools: Any) -> list[dict]:
    out: list[dict] = []
    for tool in tools.tools:
        out.append(
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description or "",
                    "parameters": tool.inputSchema or {"type": "object"},
                },
            }
        )
    return out


async def run_agentic(cfg: Config, question: str, max_steps: int = 5) -> None:
    print("Agentic MCP + RAG path")
    print(f"  chat model : {cfg.chat_model}")
    print(f"  question   : {question}")

    openai_client = OpenAI(
        base_url=cfg.openai_base_url,
        api_key=cfg.openai_api_key,
    )

    async with stdio_client(_server_params()) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_tools = await session.list_tools()
            openai_tools = _mcp_tools_to_openai_schema(mcp_tools)
            print("  MCP tools exposed to the LLM: "
                  f"{[t['function']['name'] for t in openai_tools]}")

            messages: list[dict] = [
                {
                    "role": "system",
                    "content": (
                        "You are a grounded assistant. When a question can be "
                        "answered from the local knowledge base, call the "
                        "`search_knowledge` tool first, then answer using ONLY "
                        "the retrieved passages and cite their source filenames. "
                        "If the knowledge base does not contain the answer, say so."
                    ),
                },
                {"role": "user", "content": question},
            ]

            for step in range(1, max_steps + 1):
                response = openai_client.chat.completions.create(
                    model=cfg.chat_model,
                    messages=messages,
                    tools=openai_tools,
                    tool_choice="auto",
                    temperature=0.2,
                )
                msg = response.choices[0].message
                tool_calls = msg.tool_calls or []

                if not tool_calls:
                    print(f"\n  Final answer (after {step - 1} tool call(s)):")
                    for line in (msg.content or "").splitlines():
                        print(f"    {line}")
                    return

                messages.append(
                    {
                        "role": "assistant",
                        "content": msg.content or "",
                        "tool_calls": [
                            {
                                "id": tc.id,
                                "type": "function",
                                "function": {
                                    "name": tc.function.name,
                                    "arguments": tc.function.arguments,
                                },
                            }
                            for tc in tool_calls
                        ],
                    }
                )

                for tc in tool_calls:
                    name = tc.function.name
                    try:
                        arguments = json.loads(tc.function.arguments or "{}")
                    except json.JSONDecodeError:
                        arguments = {}
                    print(f"\n  Step {step}: LLM asked for {name}({arguments})")
                    result = await session.call_tool(name, arguments)
                    text = _tool_result_to_text(result)
                    preview = text.replace("\n", " ")[:120]
                    print(f"    tool result (truncated) => {preview}...")
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": text,
                        }
                    )

            print("\n  Stopped: exceeded max_steps without a final answer.")


async def run_fallback(cfg: Config, question: str) -> None:
    print("Fallback (non-agentic) MCP + RAG path")
    print(f"  chat model : {cfg.chat_model}")
    print(f"  top-K      : {cfg.top_k}")
    print(f"  question   : {question}")

    openai_client = OpenAI(
        base_url=cfg.openai_base_url,
        api_key=cfg.openai_api_key,
    )

    async with stdio_client(_server_params()) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            print("\n  Calling search_knowledge via MCP ...")
            result = await session.call_tool(
                "search_knowledge",
                {"query": question, "k": cfg.top_k},
            )
            context = _tool_result_to_text(result)
            print("  Retrieved context (truncated):")
            for line in context.splitlines()[:10]:
                print(f"    {line}")
            if len(context.splitlines()) > 10:
                print("    ...")

            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a precise assistant. Answer the user's "
                        "question using ONLY the retrieved passages, and "
                        "cite sources by filename."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {question}",
                },
            ]
            response = openai_client.chat.completions.create(
                model=cfg.chat_model,
                messages=messages,
                temperature=0.2,
            )
            reply = response.choices[0].message.content or ""
            print("\n  Answer:")
            for line in reply.splitlines():
                print(f"    {line}")


async def amain() -> int:
    parser = argparse.ArgumentParser(description="MCP + RAG agent client.")
    parser.add_argument(
        "--question", "-q",
        default=DEFAULT_QUESTION,
        help="Question to ask.",
    )
    parser.add_argument(
        "--fallback",
        action="store_true",
        help="Skip tool calling and always retrieve once before asking the LLM.",
    )
    args = parser.parse_args()

    cfg = load_config()
    print("Configuration:")
    print(f"  base URL        : {cfg.openai_base_url}")
    print(f"  chat model      : {cfg.chat_model}")
    print(f"  embedding model : {cfg.embedding_model}")
    print()

    if args.fallback:
        await run_fallback(cfg, args.question)
    else:
        await run_agentic(cfg, args.question)

    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(amain()))
