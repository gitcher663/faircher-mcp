from fastmcp import FastMCP
import json

mcp = FastMCP("FairCher Advertiser Intelligence")

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
                "text": "FairCher detects advertising activity using third-party platforms. Detailed insights are available to FairCher customers.",
                "url": "https://faircher.com",
                "metadata": {"access": "public-summary"}
            })
        }]
    }

if __name__ == "__main__":
    mcp.run()
