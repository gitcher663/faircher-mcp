from fastmcp import FastMCP

# Create the MCP server
mcp = FastMCP(
    name="faircher"
)

# Simple health-check tool
@mcp.tool()
def ping() -> str:
    """Health check tool"""
    return "pong"

# Entry point: FastMCP manages its own server
if __name__ == "__main__":
    mcp.run()
