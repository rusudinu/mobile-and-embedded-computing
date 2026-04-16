"""MCP client for the `onia-mcp-demo` server.

By default this runs a *pure MCP* path: it spawns `server.py` as a stdio
subprocess, lists the available tools, and calls them directly with no LLM
in the loop. That path is useful on stage when the model-side tool calling
is not available or reliable.

With ``--llm`` a second path asks an LM-Studio-served chat model to decide
which tool to call via OpenAI-compatible `tools=[...]` tool calling, runs
the tool through MCP, and asks the model for a final natural-language
answer.

Run:
    uv run client_llm.py                 # pure MCP demo
    uv run client_llm.py --llm           # agentic MCP + LM Studio demo
    uv run client_llm.py --llm -q "What is 17 plus 25?"
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
    "What is 17 plus 25, and what time is it right now in Asia/Jerusalem?"
)


def _server_params() -> StdioServerParameters:
    """Spawn the server via `uv run server.py` so the right venv is used."""
    uv_path = shutil.which("uv") or "uv"
    return StdioServerParameters(
        command=uv_path,
        args=["run", str(SERVER_SCRIPT.name)],
        cwd=str(SERVER_SCRIPT.parent),
    )


def _tool_result_to_text(result: Any) -> str:
    """Flatten MCP tool result content blocks to a readable string."""
    parts: list[str] = []
    for item in result.content:
        text = getattr(item, "text", None)
        if text is not None:
            parts.append(text)
        else:
            parts.append(str(item))
    return "\n".join(parts).strip()


async def run_pure_mcp() -> None:
    print("Pure MCP path (no LLM)")
    print("  spawning server via stdio ...")
    async with stdio_client(_server_params()) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            print("\n  Tools advertised by the server:")
            for tool in tools.tools:
                print(f"    - {tool.name}: {tool.description}")

            print("\n  Calling add(a=17, b=25) ...")
            add_result = await session.call_tool("add", {"a": 17, "b": 25})
            print(f"    => {_tool_result_to_text(add_result)}")

            print("\n  Calling current_time(timezone='Asia/Jerusalem') ...")
            time_result = await session.call_tool(
                "current_time", {"timezone": "Asia/Jerusalem"}
            )
            print(f"    => {_tool_result_to_text(time_result)}")


def _mcp_tools_to_openai_schema(tools: Any) -> list[dict]:
    """Convert MCP tool descriptors to OpenAI Chat Completions `tools` shape."""
    openai_tools = []
    for tool in tools.tools:
        openai_tools.append(
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description or "",
                    "parameters": tool.inputSchema or {"type": "object"},
                },
            }
        )
    return openai_tools


async def run_llm_agent(cfg: Config, question: str, max_steps: int = 5) -> None:
    print("Agentic MCP + LM Studio path")
    print(f"  base URL   : {cfg.openai_base_url}")
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
            print(f"  MCP tools available to the LLM: "
                  f"{[t['function']['name'] for t in openai_tools]}")

            messages: list[dict] = [
                {
                    "role": "system",
                    "content": (
                        "You are a concise assistant with access to MCP tools. "
                        "Call tools when they help answer the user's question, "
                        "then reply in plain natural language."
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
                    print(f"    {msg.content}")
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
                    print(f"    tool result => {text}")
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": text,
                        }
                    )

            print("\n  Stopped: exceeded max_steps without a final answer.")


async def amain() -> int:
    parser = argparse.ArgumentParser(description="MCP client demo.")
    parser.add_argument(
        "--llm",
        action="store_true",
        help="Also run the LM-Studio-powered agentic path.",
    )
    parser.add_argument(
        "--question",
        "-q",
        default=DEFAULT_QUESTION,
        help="Question to ask the LLM (only used with --llm).",
    )
    args = parser.parse_args()

    await run_pure_mcp()

    if args.llm:
        print()
        cfg = load_config()
        await run_llm_agent(cfg, args.question)

    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(amain()))
