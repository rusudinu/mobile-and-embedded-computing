# MCP + RAG together

When RAG is exposed as an MCP tool, retrieval stops being a hard-coded
step in the pipeline and becomes a capability the language model can
choose to use. The MCP server owns the vector database and the embedding
model; the client advertises a `search_knowledge` tool to the LLM. On each
turn, the model decides whether to call the tool, the client executes the
call over MCP, and the tool result flows back into the conversation.

This gives three wins at once:

1. **Decoupling** — retrieval infrastructure (Chroma, embedding model)
   lives behind a stable tool contract.
2. **Agentic control** — the LLM calls `search_knowledge` only when it
   helps, and can call it more than once per question.
3. **Reusability** — any MCP-capable host (Claude Desktop, Cursor, a
   custom client) can plug into the same server.
