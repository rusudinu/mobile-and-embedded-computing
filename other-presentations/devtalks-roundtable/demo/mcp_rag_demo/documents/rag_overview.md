# Retrieval-Augmented Generation (RAG)

Retrieval-Augmented Generation is a technique that grounds a language model
in an external knowledge source. Instead of relying only on the model's
parametric memory, the system first retrieves the most relevant passages
from a vector database and then asks the LLM to answer using those passages
as context.

A minimal RAG pipeline has three stages: ingestion (embed and store
documents), retrieval (embed the query and find nearest neighbours), and
generation (answer with the retrieved chunks as context).
