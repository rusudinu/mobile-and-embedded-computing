# Global Makefile for all demo projects
# Requires: uv (brew install uv), LM Studio running for LLM-dependent targets

.PHONY: help setup setup-mcp setup-rag setup-mcp-rag \
        run-mcp run-mcp-llm run-rag run-rag-interactive run-mcp-rag run-mcp-rag-fallback

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

# ─── Setup ────────────────────────────────────────────────────────────────────

setup: setup-mcp setup-rag setup-mcp-rag ## Install dependencies for all projects

setup-mcp: ## Install dependencies for mcp_demo
	cd mcp_demo && uv sync

setup-rag: ## Install dependencies for rag_demo
	cd rag_demo && uv sync

setup-mcp-rag: ## Install dependencies for mcp_rag_demo
	cd mcp_rag_demo && uv sync

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

# ─── MCP + RAG Demo ──────────────────────────────────────────────────────────

run-mcp-rag: ## Run mcp_rag_demo in agentic mode (requires LM Studio)
	cd mcp_rag_demo && uv run client_agent.py

run-mcp-rag-fallback: ## Run mcp_rag_demo in fallback mode (no tool calling)
	cd mcp_rag_demo && uv run client_agent.py --fallback
