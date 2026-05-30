# Global Makefile for all demo projects
# Requires: uv (brew install uv), LM Studio running for LLM-dependent targets

.PHONY: help setup setup-mcp setup-rag setup-mcp-rag setup-mcp-rag-web \
        run-mcp run-mcp-llm run-rag run-rag-interactive run-rag-notebook run-mcp-rag run-mcp-rag-fallback \
        run-mcp-rag-web run-mcp-rag-web-fallback \
        serve-mcp serve-mcp-rag serve-mcp-rag-web serve-all

# HTTP ports used when serving MCP servers for LM Studio (Streamable HTTP).
MCP_PORT          ?= 8000
MCP_RAG_PORT      ?= 8001
MCP_RAG_WEB_PORT  ?= 8002

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

# ─── Setup ────────────────────────────────────────────────────────────────────

setup: setup-mcp setup-rag setup-mcp-rag setup-mcp-rag-web ## Install dependencies for all projects

setup-mcp: ## Install dependencies for mcp_demo
	cd mcp_demo && uv sync

setup-rag: ## Install dependencies for rag_demo
	cd rag_demo && uv sync

setup-mcp-rag: ## Install dependencies for mcp_rag_demo
	cd mcp_rag_demo && uv sync

setup-mcp-rag-web: ## Install dependencies for mcp_rag_demo_web_search
	cd mcp_rag_demo_web_search && uv sync

# ─── MCP Demo ─────────────────────────────────────────────────────────────────

run-mcp: ## Run mcp_demo in pure MCP mode (no LLM needed)
	cd mcp_demo && uv run client_llm.py

run-mcp-llm: ## Run mcp_demo with LLM tool calling (requires LM Studio)
	cd mcp_demo && uv run client_llm.py --llm

# ─── RAG Demo ─────────────────────────────────────────────────────────────────

run-rag: ## Run rag_demo with default question (requires LM Studio)
	cd rag_demo && uv run ingest_and_chat.py

run-rag-interactive: ## Run rag_demo in interactive REPL mode
	cd rag_demo && uv run ingest_and_chat.py --interactive

run-rag-notebook: ## Open the step-by-step RAG + tool calling notebook
	uv run --with jupyterlab --with chromadb --with openai --with python-dotenv jupyter lab rag_tool_calling_walkthrough.ipynb

# ─── MCP + RAG Demo ──────────────────────────────────────────────────────────

run-mcp-rag: ## Run mcp_rag_demo in agentic mode (requires LM Studio)
	cd mcp_rag_demo && uv run client_agent.py

run-mcp-rag-fallback: ## Run mcp_rag_demo in fallback mode (no tool calling)
	cd mcp_rag_demo && uv run client_agent.py --fallback

# ─── MCP + RAG + Web Search Demo ─────────────────────────────────────────────

run-mcp-rag-web: ## Run mcp_rag_demo_web_search in agentic mode (requires LM Studio + internet)
	cd mcp_rag_demo_web_search && uv run client_agent.py

run-mcp-rag-web-fallback: ## Run mcp_rag_demo_web_search in fallback mode (no tool calling)
	cd mcp_rag_demo_web_search && uv run client_agent.py --fallback

# ─── Serve MCP servers over HTTP (for LM Studio) ─────────────────────────────
# Start a server yourself, then point LM Studio at http://127.0.0.1:<port>/mcp.
# Each runs in the foreground; use a separate terminal per server.

serve-mcp: ## Serve mcp_demo over HTTP at :$(MCP_PORT)/mcp
	cd mcp_demo && uv run server.py --http --port $(MCP_PORT)

serve-mcp-rag: ## Serve mcp_rag_demo over HTTP at :$(MCP_RAG_PORT)/mcp (requires LM Studio for tools)
	cd mcp_rag_demo && uv run server.py --http --port $(MCP_RAG_PORT)

serve-mcp-rag-web: ## Serve mcp_rag_demo_web_search over HTTP at :$(MCP_RAG_WEB_PORT)/mcp
	cd mcp_rag_demo_web_search && uv run server.py --http --port $(MCP_RAG_WEB_PORT)

serve-all: ## Serve all three MCP servers over HTTP at once (Ctrl+C stops all)
	@echo "Starting all MCP servers over HTTP (Ctrl+C to stop all):"
	@echo "  mcp_demo                -> http://127.0.0.1:$(MCP_PORT)/mcp"
	@echo "  mcp_rag_demo            -> http://127.0.0.1:$(MCP_RAG_PORT)/mcp"
	@echo "  mcp_rag_demo_web_search -> http://127.0.0.1:$(MCP_RAG_WEB_PORT)/mcp"
	@trap 'kill 0' INT TERM EXIT; \
	(cd mcp_demo && uv run server.py --http --port $(MCP_PORT)) & \
	(cd mcp_rag_demo && uv run server.py --http --port $(MCP_RAG_PORT)) & \
	(cd mcp_rag_demo_web_search && uv run server.py --http --port $(MCP_RAG_WEB_PORT)) & \
	wait
