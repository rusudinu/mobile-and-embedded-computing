# LM Studio local server

LM Studio is a desktop application that lets you download open-weight
language models and serve them locally through an OpenAI-compatible HTTP
API. The default base URL is `http://127.0.0.1:1234/v1`.

For this demo you need to load two models in LM Studio:

- A chat model: `qwen/qwen3.5-9b`
- An embedding model: `text-embedding-qwen3-embedding-4b`

Then start the local server from the Developer tab. Any code that uses the
`openai` Python SDK can talk to it by setting the `base_url` to the address
above and passing any placeholder API key (the server does not validate
keys).
