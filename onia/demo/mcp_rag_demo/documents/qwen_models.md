# Qwen models used in this demo

The chat model is `qwen/qwen3.5-9b`, a 9-billion-parameter instruction
tuned model from Alibaba's Qwen family. Its tool-calling support is used
by this demo to decide when to invoke the `search_knowledge` MCP tool.

The embedding model is `text-embedding-qwen3-embedding-4b`, a 4B-parameter
dense embedding model. Inside the MCP server it vectorizes both the corpus
and every incoming query so that similarity search over Chroma stays
consistent.

Both models are served locally via LM Studio's OpenAI-compatible endpoint.
