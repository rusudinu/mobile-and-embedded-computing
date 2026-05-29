# DevTalks demos: RAG, MCP, MCP + RAG

Three **independent** Python projects for talks about [DevTalks](https://www.devtalks.ro/)
(Romania's developer conference). Each folder
is a standalone [uv](https://docs.astral.sh/uv/) project with its own
`pyproject.toml`, `uv.lock`, `.env.example`, and README — you can clone
just one folder and it will still run.

| Folder | What it shows | When to present it |
|--------|---------------|--------------------|
| [`rag_demo/`](rag_demo/) | Classic RAG pipeline: in-memory Chroma + embeddings + grounded chat completion. | First — introduces retrieval-augmented generation with zero MCP vocabulary. |
| [`mcp_demo/`](mcp_demo/) | An MCP stdio server exposing `add` and `current_time`, consumed both directly and by an LLM using OpenAI-compatible tool calling. | Second — introduces MCP as a contract between processes. |
| [`mcp_rag_demo/`](mcp_rag_demo/) | RAG re-framed as an MCP tool: the server owns Chroma; the LLM decides when to call `search_knowledge`. | Third — ties the two stories together. |

## Shared prerequisites

All three demos use:

- [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for
  dependency and environment management.
- [LM Studio](https://lmstudio.ai/) as the OpenAI-compatible local LLM
  server (default `http://127.0.0.1:1234/v1`).
- Chat model `qwen/qwen3.5-9b` and embedding model
  `text-embedding-qwen3-embedding-4b`, both loaded in LM Studio.

## How to run any single demo

```bash
cd <demo_folder>
uv sync
cp .env.example .env        # only if you need to change defaults
uv run <entrypoint>.py      # see the folder's README for the entrypoint
```

Entrypoints:

- `rag_demo/` → `uv run ingest_and_chat.py`
- `mcp_demo/` → `uv run client_llm.py` (add `--llm` to involve LM Studio)
- `mcp_rag_demo/` → `uv run client_agent.py` (add `--fallback` to skip tool calling)

## Isolation guarantee

There are no Python imports across these folders. The `config.py`,
`.env.example`, and documents are deliberately duplicated so each demo
stands alone and can be presented (or extracted) on its own.
