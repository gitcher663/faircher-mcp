import json
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from fastmcp import FastMCP

# Create FastAPI app
app = FastAPI()

# Attach MCP to FastAPI
mcp = FastMCP(
    "FairCher Advertiser Intelligence",
    app=app
)

# MCP search tool
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

# MCP fetch tool
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
        }]
    }

# Health check (Cloud Run)
@app.get("/")
def root():
    return {"status": "FairCher MCP server online"}

# OpenAI domain verification endpoint
@app.get("/.well-known/openai-apps-challenge")
def openai_verify():
    return PlainTextResponse(
        "R8RPkntk796SA6rB3_JV9QjO7LeEDF2VpGn5BVZ8pU"
    )
