"""MCP stdio server that wraps an in-memory Chroma RAG index as a tool.

The server builds a fresh `chromadb.EphemeralClient` collection from the
markdown files in `documents/` and advertises a single tool,
`search_knowledge(query, k)`, which embeds the query via LM Studio and
returns the top-K matching passages.

Launched automatically by `client_agent.py`; can also be run directly:

    uv run server.py
"""

from __future__ import annotations

import sys
from pathlib import Path
from threading import Lock

import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from mcp.server import MCPServer
from openai import OpenAI

from config import Config, load_config

DOCS_DIR = Path(__file__).parent / "documents"
COLLECTION_NAME = "onia_mcp_rag_demo"

mcp = MCPServer("onia-mcp-rag-demo")

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
def list_sources() -> list[str]:
    """Return the filenames of every document currently indexed."""
    _ensure_index()
    collection = _state["collection"]
    peek = collection.get()
    return sorted({m["source"] for m in peek["metadatas"]})


if __name__ == "__main__":
    mcp.run(transport="stdio")
