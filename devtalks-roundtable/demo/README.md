# DevTalks demos: RAG, MCP, MCP + RAG

Four Python demos for talks about [DevTalks](https://www.devtalks.ro/)
(Romania's developer conference). Each demo folder is its own
[uv](https://docs.astral.sh/uv/) project with its own `pyproject.toml`,
`uv.lock`, `.env.example`, and README. The local knowledge-base markdown
files are shared from the top-level [`documents/`](documents/) folder.

| Folder | What it shows | When to present it |
|--------|---------------|--------------------|
| [`rag_demo/`](rag_demo/) | Classic RAG pipeline: in-memory Chroma + embeddings + grounded chat completion. | First — introduces retrieval-augmented generation with zero MCP vocabulary. |
| [`mcp_demo/`](mcp_demo/) | An MCP stdio server exposing `add` and `current_time`, consumed both directly and by an LLM using OpenAI-compatible tool calling. | Second — introduces MCP as a contract between processes. |
| [`mcp_rag_demo/`](mcp_rag_demo/) | RAG re-framed as an MCP tool: the server owns Chroma; the LLM decides when to call `search_knowledge`. | Third — ties the two stories together. |
| [`mcp_rag_demo_web_search/`](mcp_rag_demo_web_search/) | Same as `mcp_rag_demo` plus a `search_web` tool; the LLM chooses between local retrieval and live DuckDuckGo search. | Fourth — shows an agent routing between multiple MCP tools. |

## Shared prerequisites

All four demos use:

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
- root-level notebook → `make run-rag-notebook`
- `mcp_demo/` → `uv run client_llm.py` (add `--llm` to involve LM Studio)
- `mcp_rag_demo/` → `uv run client_agent.py` (add `--fallback` to skip tool calling)
- `mcp_rag_demo_web_search/` → `uv run client_agent.py` (add `--fallback` to skip tool calling)

A top-level [`Makefile`](Makefile) wraps these. Run `make help` to see
every target (`make setup`, `make run-mcp`, `make run-rag`,
`make run-mcp-rag`, `make run-mcp-rag-web`, …).

## Connecting the MCP servers to LM Studio (HTTP mode)

Three of these folders are MCP **servers** whose tools the model can call
from inside a normal LM Studio chat:

- `mcp_demo/server.py` → `add`, `current_time`
- `mcp_rag_demo/server.py` → `search_knowledge`, `list_sources`
- `mcp_rag_demo_web_search/server.py` → `search_knowledge`, `search_web`, `fetch_page`, `current_date`, `list_sources`

(`rag_demo/` is a standalone script, not an MCP server, so it is not
listed here.)

LM Studio can connect to an MCP server two ways: it can **spawn it as a
stdio subprocess**, or it can **connect to an already-running server over
HTTP** by URL. We use **HTTP**: you start each server yourself with
`make`, and LM Studio just connects to it.

### Why HTTP instead of stdio

The stdio approach (`"command": "uv", "args": ["run", ...]` in `mcp.json`)
makes LM Studio launch the process itself. On macOS that's fragile: the
app doesn't inherit your shell `PATH`/environment, so the `uv` spawn chain
can fail with `No such file or directory (os error 2)` — exactly the error
in the developer logs.

HTTP mode avoids all of that:

- **You** start the server in your own shell (full `PATH`, correct `.venv`
  and `.env`), so there's nothing for LM Studio to mis-spawn.
- The `mcp.json` entries are just URLs — no absolute `uv` path, no
  per-machine `--directory` to maintain.
- You can watch each server's logs live in its terminal.

> Note: this is separate from LM Studio's own API server on `:1234`, which
> serves the *LLM* (chat + embeddings). The ports below (`8000`–`8002`)
> are the *MCP* servers that provide tools.

### Step 1 — install dependencies (once)

```bash
make setup            # or: cd <folder> && uv sync, per folder
```

### Step 2 — start the server(s) you want, each in its own terminal

```bash
make serve-mcp           # mcp_demo               -> http://127.0.0.1:8000/mcp
make serve-mcp-rag       # mcp_rag_demo           -> http://127.0.0.1:8001/mcp
make serve-mcp-rag-web   # mcp_rag_demo_web_search-> http://127.0.0.1:8002/mcp
```

Each runs in the foreground and stays up until you Ctrl+C it. You only
need to start the one(s) you plan to demo. Override a port if needed:
`make serve-mcp MCP_PORT=9000`.

Or start all three at once in a single terminal (Ctrl+C stops all):

```bash
make serve-all
```

### Step 3 — register the URLs in `mcp.json` once

In LM Studio: right-hand sidebar → **Program** tab → **Install → Edit
mcp.json**. Paste all three URLs under `mcpServers`:

```jsonc
{
  "mcpServers": {
    "devtalks-mcp-demo": {
      "url": "http://127.0.0.1:8000/mcp"
    },
    "devtalks-mcp-rag-demo": {
      "url": "http://127.0.0.1:8001/mcp"
    },
    "devtalks-mcp-rag-web-demo": {
      "url": "http://127.0.0.1:8002/mcp"
    }
  }
}
```

A ready-to-paste copy lives at
[`mcp.lmstudio.json`](mcp.lmstudio.json). Because these are fixed
localhost URLs, this file is the same on every machine — paste it once and
you never edit it again.

Save the file. LM Studio connects to whichever of those servers are
currently running (you may need to confirm/allow each one the first time).
Servers you haven't started yet simply show as unavailable until you
`make serve-...` them.

### Step 4 — switch demos without editing config

Two equivalent ways to choose which demo is "live", neither touches
`mcp.json`:

- **By what's running:** only `make serve-...` the server you're
  presenting. The others stay offline.
- **By UI toggle:** in a chat, open the tools/plugins control (the
  **Program** / tool icon in the chat input) and enable only the server
  you want; the model then sees only that server's tools.

So the flow is: start with `devtalks-mcp-demo` for the tools intro, then
`devtalks-mcp-rag-demo` for RAG-as-a-tool, then `devtalks-mcp-rag-web-demo`
to add live web search — all without leaving the chat window.

> The standalone CLI clients (`client_llm.py`, `client_agent.py`) still
> work exactly as before and spawn their own stdio server; the HTTP setup
> above is purely for driving the same tools from LM Studio's chat UI.

## Project boundaries

There are no Python imports across these folders. The `config.py` and
`.env.example` files are deliberately duplicated so each demo keeps its
own runtime configuration, while all RAG examples read the same shared
top-level [`documents/`](documents/) corpus.
