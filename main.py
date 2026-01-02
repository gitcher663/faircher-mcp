from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from fastmcp import FastMCP

# ---- FastAPI app (used for HTTP + domain verification) ----
app = FastAPI()

@app.get("/.well-known/openai-apps-challenge")
async def openai_apps_challenge():
    return PlainTextResponse(
        content="R8RPkntk796SA6rB3_JYV9QjO7LeEDF2VpGn5BVZ8pU",
        media_type="text/plain"
    )

# ---- FastMCP server ----
mcp = FastMCP(
    name="Faircher MCP",
    description="Faircher MCP server"
)

@mcp.tool()
def ping() -> str:
    """Health check tool"""
    return "pong"

# Mount MCP under /mcp (this is IMPORTANT)
app.mount("/mcp", mcp.app())
