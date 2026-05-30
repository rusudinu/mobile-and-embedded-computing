"""MCP stdio server that wraps an in-memory Chroma RAG index plus web search.

The server builds a fresh `chromadb.EphemeralClient` collection from the
markdown files in the shared top-level `documents/` folder and advertises these tools:

- `search_knowledge(query, k)` — embeds the query via LM Studio and returns
  the top-K matching passages from the local knowledge base.
- `search_web(query, k)` — performs a live DuckDuckGo web search via the
  `ddgs` metasearch library and returns the top-K result snippets.
- `fetch_page(url, max_chars)` — fetches a URL (usually one returned by
  `search_web`) and returns its readable page content as Markdown, so the
  model can drill past the snippet into the actual page.
- `current_date(timezone)` — returns today's date so the model can ground
  questions about "today", "this year", etc. before searching the web.
- `list_sources()` — lists the indexed local documents.

Launched automatically by `client_agent.py`; can also be run directly:

    uv run server.py            # stdio (default)
    uv run server.py --http     # Streamable HTTP at http://127.0.0.1:8002/mcp
"""

from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path
from threading import Lock
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from ddgs import DDGS
from mcp.server.fastmcp import FastMCP
from openai import OpenAI

from config import Config, load_config

DOCS_DIR = Path(__file__).resolve().parents[1] / "documents"
COLLECTION_NAME = "devtalks_mcp_rag_web_demo"

mcp = FastMCP("devtalks-mcp-rag-web-demo")

_state: dict = {}
_init_lock = Lock()


def _log(msg: str) -> None:
    """Log to stderr so we never corrupt the stdio JSON-RPC stream."""
    print(msg, file=sys.stderr, flush=True)


class OpenAIEmbeddingFunction(EmbeddingFunction[Documents]):
    def __init__(self, client: OpenAI, model: str) -> None:
        self._client = client
        self._model = model

    def __call__(self, inputs: Documents) -> Embeddings:
        response = self._client.embeddings.create(
            model=self._model,
            input=list(inputs),
        )
        return [item.embedding for item in response.data]


def _ensure_index() -> None:
    """Lazily build the Chroma index on first tool call.

    Deferring until first use means `list_tools` works even when LM Studio
    is not running yet, which makes the demo easier to narrate.
    """
    if _state.get("collection") is not None:
        return
    with _init_lock:
        if _state.get("collection") is not None:
            return

        cfg: Config = load_config()
        _log(f"[mcp-rag] initializing index (embed model={cfg.embedding_model})")

        openai_client = OpenAI(
            base_url=cfg.openai_base_url,
            api_key=cfg.openai_api_key,
        )
        embedder = OpenAIEmbeddingFunction(openai_client, cfg.embedding_model)

        chroma = chromadb.EphemeralClient()
        collection = chroma.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=embedder,
        )

        md_files = sorted(DOCS_DIR.glob("*.md"))
        if not md_files:
            raise FileNotFoundError(f"No markdown files in {DOCS_DIR}")
        ids = [f.stem for f in md_files]
        texts = [f.read_text(encoding="utf-8") for f in md_files]
        metadatas = [{"source": f.name} for f in md_files]
        collection.add(ids=ids, documents=texts, metadatas=metadatas)
        _log(f"[mcp-rag] indexed {len(md_files)} documents")

        _state["cfg"] = cfg
        _state["collection"] = collection


@mcp.tool()
def search_knowledge(query: str, k: int = 3) -> str:
    """Search the local knowledge base and return the top-k passages.

    Args:
        query: Natural-language question or topic to search for.
        k: Number of passages to return (default 3).

    Returns:
        A newline-separated list of passages, each prefixed with its
        source filename.
    """
    _ensure_index()
    collection = _state["collection"]
    result = collection.query(query_texts=[query], n_results=k)
    docs = result["documents"][0]
    metas = result["metadatas"][0]
    distances = result["distances"][0]

    if not docs:
        return "No matching passages found."

    blocks: list[str] = []
    for doc, meta, distance in zip(docs, metas, distances):
        blocks.append(
            f"[source: {meta['source']}] (distance={distance:.4f})\n{doc.strip()}"
        )
    return "\n\n---\n\n".join(blocks)


@mcp.tool()
def search_web(query: str, k: int = 5) -> str:
    """Search the live web (via DuckDuckGo) and return the top-k results.

    Use this when the question is about current events or information that
    is unlikely to be in the local knowledge base.

    The results are short snippets only. If a result looks relevant but the
    snippet does not fully answer the question, call `fetch_page(url)` on its
    URL to read the full page content before answering.

    Args:
        query: Natural-language web search query.
        k: Number of results to return (default 5).

    Returns:
        A numbered list of results, each with its title, URL, and a short
        snippet.
    """
    _log(f"[mcp-rag] web search: {query!r} (k={k})")
    try:
        results = DDGS().text(query, max_results=k)
    except Exception as exc:  # noqa: BLE001 - surface the error to the LLM
        return f"Web search failed: {exc}"

    if not results:
        return "No web results found."

    blocks: list[str] = []
    for i, item in enumerate(results, start=1):
        title = item.get("title", "").strip()
        href = item.get("href", "").strip()
        body = item.get("body", "").strip()
        blocks.append(f"{i}. {title}\n   URL: {href}\n   {body}")
    return "\n\n".join(blocks)


@mcp.tool()
def fetch_page(url: str, max_chars: int = 6000) -> str:
    """Fetch a web page and return its readable text content as Markdown.

    Use this after `search_web` when a result's snippet is not enough: pass
    the result's URL here to read the actual page (e.g. a speaker lineup,
    an agenda, or an article body) and answer from its full content.

    Args:
        url: The URL to fetch (typically taken from a `search_web` result).
        max_chars: Truncate the returned content to this many characters to
            keep it within the model's context (default 6000).

    Returns:
        The page content converted to Markdown, truncated if very long, or
        an error message if the page could not be fetched.
    """
    _log(f"[mcp-rag] fetch page: {url!r} (max_chars={max_chars})")
    try:
        result = DDGS().extract(url)
    except Exception as exc:  # noqa: BLE001 - surface the error to the LLM
        return f"Failed to fetch {url}: {exc}"

    content = result.get("content", "") if isinstance(result, dict) else str(result)
    if isinstance(content, bytes):
        content = content.decode("utf-8", errors="replace")
    content = content.strip()
    if not content:
        return f"No readable content extracted from {url}."

    if len(content) > max_chars:
        content = content[:max_chars].rstrip() + "\n\n[... truncated ...]"
    return f"Content of {url}:\n\n{content}"


@mcp.tool()
def current_date(timezone: str = "UTC") -> str:
    """Return today's date in the given IANA timezone.

    Use this to ground questions that mention "today", "this year", "now", or if you
    need to figure out the year for an event or other relative dates before deciding what to search for.

    Args:
        timezone: IANA timezone name, e.g. "UTC", "Europe/Bucharest",
            "America/New_York". Defaults to "UTC".

    Returns:
        The current date as "YYYY-MM-DD (Weekday)", or an error message if
        the timezone is not recognized.
    """
    try:
        tz = ZoneInfo(timezone)
    except ZoneInfoNotFoundError:
        return f"Unknown timezone: {timezone!r}"
    now = datetime.now(tz)
    return f"{now:%Y-%m-%d (%A)}"


@mcp.tool()
def list_sources() -> list[str]:
    """Return the filenames of every document currently indexed."""
    _ensure_index()
    collection = _state["collection"]
    peek = collection.get()
    return sorted({m["source"] for m in peek["metadatas"]})


def _run() -> None:
    """Run over stdio (default) or Streamable HTTP (`--http`).

    HTTP mode lets you start the server yourself (e.g. `make serve-mcp-rag-web`)
    and have LM Studio connect to it by URL instead of spawning it as a stdio
    subprocess.
    """
    import argparse

    parser = argparse.ArgumentParser(
        description="devtalks mcp_rag_demo_web_search server"
    )
    parser.add_argument(
        "--http",
        action="store_true",
        help="Serve over Streamable HTTP instead of stdio.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="HTTP bind host.")
    parser.add_argument("--port", type=int, default=8002, help="HTTP bind port.")
    args = parser.parse_args()

    if args.http:
        mcp.settings.host = args.host
        mcp.settings.port = args.port
        mcp.run(transport="streamable-http")
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    _run()
