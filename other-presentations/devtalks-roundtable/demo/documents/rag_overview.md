# Retrieval-Augmented Generation (RAG)

Retrieval-Augmented Generation is a technique that grounds a language model
in an external knowledge source. Instead of relying only on the model's
parametric memory, the system first retrieves the most relevant passages
from a vector database and then asks the LLM to answer using those passages
as context.

A minimal RAG pipeline has three stages:

1. Ingestion: split documents into chunks, embed each chunk, and store the
   vectors together with the original text in a vector database.
2. Retrieval: embed the user's question with the same embedding model and
   query the vector database for the top-K nearest chunks.
3. Generation: pass the retrieved chunks as context to the LLM alongside
   the user question, and instruct the model to answer using only that
   context.

The benefits are reduced hallucination, easy knowledge updates (just
re-ingest), and the ability to cite sources.
