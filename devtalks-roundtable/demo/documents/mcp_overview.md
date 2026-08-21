# Model Context Protocol (MCP)

The Model Context Protocol is an open standard that lets language-model
applications connect to external tools, data, and prompts in a uniform way.
A host application (the client) speaks JSON-RPC to one or more MCP servers,
each of which advertises capabilities such as:

- **Tools** — functions the LLM may call, with JSON-schema input and
  structured output.
- **Resources** — read-only data the host can load into the model's
  context.
- **Prompts** — named prompt templates the server exposes to the host.

Transports include stdio (subprocess-friendly, great for local demos) and
HTTP/SSE. Because the contract is transport-agnostic JSON-RPC, any
language can implement either side.
