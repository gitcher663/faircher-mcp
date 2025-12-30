import json
from fastapi import FastAPI
from fastmcp import FastMCP

# Create FastAPI app
app = FastAPI()

# Attach MCP to FastAPI
mcp = FastMCP(
    "FairCher Advertiser Intelligence",
    app=app
)

@mcp.tool()
def search(query: str):
    results = [{
        "id": query.lower().replace(" ", "-"),
        "title": query,
        "url": "https://faircher.com"
    }]
    return {
        "content": [{
            "type": "text",
            "text": json.dumps({"results": results})
        }]
    }

@mcp.tool()
def fetch(id: str):
    return {
        "content": [{
            "type": "text",
            "text": json.dumps({
                "id": id,
                "title": id.title(),
                "text": (
                    "FairCher detects advertising activity using third-party platforms. "
                    "Detailed insights are available to FairCher customers."
                ),
                "url": "https://faircher.com",
                "metadata": {"access": "public-summary"}
            })
