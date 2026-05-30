# Qwen models used in this demo

The chat model in this demo is `qwen/qwen3.5-9b`, a 9-billion-parameter
general-purpose instruction-tuned model from Alibaba's Qwen family. It is
well suited for retrieval-augmented generation because it follows grounded
system prompts reliably, handles moderately long contexts, and can be used
for OpenAI-compatible tool calling in the MCP demos.

The embedding model is `text-embedding-qwen3-embedding-4b`, a 4B-parameter
embedding model that produces dense vectors used for semantic similarity
search over the document corpus. The demos use the same embedding model
for both stored documents and incoming questions so Chroma compares vectors
from the same space.

Both models are served locally via LM Studio's OpenAI-compatible endpoint,
which means the demo code uses the standard `openai` Python SDK and only
changes the `base_url`.
