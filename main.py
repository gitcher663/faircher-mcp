from fastmcp import FastMCP

# Create the MCP server
mcp = FastMCP(
    name="faircher"
)

# OPTIONAL: example tool (safe to keep or remove)
@mcp.tool()
def ping() -> str:
    """Health check tool"""
    return "pong"

# Expose the ASGI app for uvicorn
app = mcp.app
