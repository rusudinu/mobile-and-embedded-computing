"""Environment-backed configuration for the MCP demo."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Config:
    openai_base_url: str
    openai_api_key: str
    chat_model: str


def load_config() -> Config:
    return Config(
        openai_base_url=os.getenv("OPENAI_BASE_URL", "http://127.0.0.1:1234/v1"),
        openai_api_key=os.getenv("OPENAI_API_KEY", "lm-studio"),
        chat_model=os.getenv("CHAT_MODEL", "qwen/qwen3.5-9b"),
    )
