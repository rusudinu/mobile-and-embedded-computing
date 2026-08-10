"""A minimal MCP stdio server built with MCPServer.

Exposes two tiny, audience-friendly tools:

- `add(a, b)` — integer addition.
- `current_time(timezone)` — returns the current wall-clock time.

Runs over stdio so the client can spawn it as a subprocess. Launch on its
own for debugging:

    uv run server.py            # stdio (default)
    uv run server.py --http     # Streamable HTTP at http://127.0.0.1:8000/mcp

...but normally `client_llm.py` starts it automatically.
"""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from mcp.server import MCPServer

mcp = MCPServer("devtalks-mcp-demo")


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


def _run() -> None:
    """Run over stdio (default) or Streamable HTTP (`--http`).

    HTTP mode lets you start the server yourself (e.g. `make serve-mcp`) and
    have LM Studio connect to it by URL instead of spawning it as a stdio
    subprocess.
    """
    import argparse

    parser = argparse.ArgumentParser(description="devtalks mcp_demo server")
    parser.add_argument(
        "--http",
        action="store_true",
        help="Serve over Streamable HTTP instead of stdio.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="HTTP bind host.")
    parser.add_argument("--port", type=int, default=8000, help="HTTP bind port.")
    args = parser.parse_args()

    if args.http:
        mcp.run(transport="streamable-http", host=args.host, port=args.port)
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    _run()
