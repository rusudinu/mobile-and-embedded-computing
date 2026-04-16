"""End-to-end RAG demo: ingest local markdown files into an in-memory
Chroma collection, retrieve the top-K relevant chunks for a question, and
ask an LM Studio-served chat model to answer using only those chunks.

Run:
    uv run ingest_and_chat.py
    uv run ingest_and_chat.py --question "What embedding model is used?"
    uv run ingest_and_chat.py --interactive
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable

import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from openai import OpenAI

from config import Config, load_config

DOCS_DIR = Path(__file__).parent / "documents"
COLLECTION_NAME = "onia_rag_demo"
DEFAULT_QUESTION = "What embedding model does this demo use and why?"


class OpenAIEmbeddingFunction(EmbeddingFunction[Documents]):
    """Chroma embedding function backed by an OpenAI-compatible endpoint.

    Chroma calls this with a list of strings; we forward them to
    `client.embeddings.create` and return a list of float vectors.
    """

    def __init__(self, client: OpenAI, model: str) -> None:
        self._client = client
        self._model = model

    def __call__(self, inputs: Documents) -> Embeddings:
        response = self._client.embeddings.create(
            model=self._model,
            input=list(inputs),
        )
        return [item.embedding for item in response.data]


def load_markdown_files(directory: Path) -> list[tuple[str, str]]:
    """Return (id, text) pairs for every .md file in `directory`."""
    files = sorted(directory.glob("*.md"))
    if not files:
        raise FileNotFoundError(f"No markdown files found in {directory}")
    return [(f.stem, f.read_text(encoding="utf-8")) for f in files]


def build_collection(
    chroma: chromadb.api.ClientAPI,
    embedder: OpenAIEmbeddingFunction,
    docs: Iterable[tuple[str, str]],
) -> chromadb.api.models.Collection.Collection:
    """Create a fresh in-memory collection and populate it."""
    collection = chroma.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedder,
    )
    ids, texts, metadatas = [], [], []
    for doc_id, text in docs:
        ids.append(doc_id)
        texts.append(text)
        metadatas.append({"source": f"{doc_id}.md"})
    collection.add(ids=ids, documents=texts, metadatas=metadatas)
    return collection


def retrieve(collection, question: str, top_k: int) -> list[dict]:
    result = collection.query(query_texts=[question], n_results=top_k)
    hits = []
    for doc, meta, distance in zip(
        result["documents"][0],
        result["metadatas"][0],
        result["distances"][0],
    ):
        hits.append({"text": doc, "source": meta["source"], "distance": distance})
    return hits


def build_prompt(question: str, hits: list[dict]) -> list[dict]:
    context = "\n\n".join(
        f"[source: {h['source']}]\n{h['text']}" for h in hits
    )
    system = (
        "You are a precise assistant. Answer the user's question using ONLY "
        "the information in the provided context. If the answer is not in "
        "the context, say you do not know. Cite sources by filename."
    )
    user = f"Context:\n{context}\n\nQuestion: {question}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def answer(cfg: Config, openai_client: OpenAI, collection, question: str) -> str:
    print(f"\n> Question: {question}")
    hits = retrieve(collection, question, cfg.top_k)
    print(f"\n  Retrieved top-{cfg.top_k} passages:")
    for i, hit in enumerate(hits, 1):
        preview = hit["text"].strip().replace("\n", " ")[:90]
        print(f"   {i}. {hit['source']}  (distance={hit['distance']:.4f})  {preview}...")

    messages = build_prompt(question, hits)
    response = openai_client.chat.completions.create(
        model=cfg.chat_model,
        messages=messages,
        temperature=0.2,
    )
    reply = response.choices[0].message.content or ""
    print("\n  Answer:")
    for line in reply.splitlines():
        print(f"   {line}")
    return reply


def main() -> int:
    parser = argparse.ArgumentParser(description="In-memory RAG demo.")
    parser.add_argument(
        "--question",
        "-q",
        default=DEFAULT_QUESTION,
        help="Question to answer (used unless --interactive is set).",
    )
    parser.add_argument(
        "--interactive",
        "-i",
        action="store_true",
        help="Ask questions interactively in a REPL.",
    )
    args = parser.parse_args()

    cfg = load_config()
    print("RAG demo configuration:")
    print(f"  base URL         : {cfg.openai_base_url}")
    print(f"  chat model       : {cfg.chat_model}")
    print(f"  embedding model  : {cfg.embedding_model}")
    print(f"  top-K            : {cfg.top_k}")

    openai_client = OpenAI(
        base_url=cfg.openai_base_url,
        api_key=cfg.openai_api_key,
    )
    embedder = OpenAIEmbeddingFunction(openai_client, cfg.embedding_model)
    chroma = chromadb.EphemeralClient()

    print("\nIngesting documents from ./documents ...")
    docs = load_markdown_files(DOCS_DIR)
    collection = build_collection(chroma, embedder, docs)
    print(f"  indexed {len(docs)} documents into collection '{COLLECTION_NAME}'.")

    if args.interactive:
        print("\nInteractive mode. Type a question, or 'quit' to exit.\n")
        while True:
            try:
                question = input("? ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if not question:
                continue
            if question.lower() in {"quit", "exit", ":q"}:
                break
            answer(cfg, openai_client, collection, question)
    else:
        answer(cfg, openai_client, collection, args.question)

    return 0


if __name__ == "__main__":
    sys.exit(main())
