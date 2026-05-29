"""A minimal MCP stdio server built with FastMCP.

Exposes two tiny, audience-friendly tools:

- `add(a, b)` — integer addition.
- `current_time(timezone)` — returns the current wall-clock time.

Runs over stdio so the client can spawn it as a subprocess. Launch on its
own for debugging:

    uv run server.py

...but normally `client_llm.py` starts it automatically.
"""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("devtalks-mcp-demo")


@mcp.tool()
def add(a: int, b: int) -> int:
    """Return the sum of two integers."""
    return a + b


@mcp.tool()
def current_time(timezone: str = "UTC") -> str:
    """Return the current time in the given IANA timezone.

    Example timezones: "UTC", "Asia/Jerusalem", "America/New_York".
    """
    try:
        tz = ZoneInfo(timezone)
    except ZoneInfoNotFoundError:
        return f"Unknown timezone: {timezone!r}"
    return datetime.now(tz).isoformat(timespec="seconds")


if __name__ == "__main__":
    mcp.run(transport="stdio")
