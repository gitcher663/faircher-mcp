import os
import requests
from typing import Dict
from fastmcp import FastMCP

# ------------------------------------------------------------------------------
# MCP Server
# ------------------------------------------------------------------------------
mcp = FastMCP(name="faircher")

SERPAPI_ENDPOINT = "https://serpapi.com/search.json"
SERPAPI_KEY = os.environ.get("SERPAPI_API_KEY")


# ------------------------------------------------------------------------------
# Tool definition
# ------------------------------------------------------------------------------
@mcp.tool(
    name="detect_google_ad_activity",
    description=(
        "Use this tool when the user asks whether a company or domain is "
        "currently advertising on Google platforms."
    ),
    annotations={
        "readOnlyHint": True,
    },
)
def detect_google_ad_activity(
    company: str,
    lookback_days: int = 90,
    region: str = "2840",
) -> Dict:
    params = {
        "engine": "google_ads_transparency_center",
        "api_key": SERPAPI_KEY,
        "region": region,
        "text": company,
        "num": 10,
    }

    response = requests.get(SERPAPI_ENDPOINT, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()

    creatives = data.get("ad_creatives", [])
    is_advertising = len(creatives) > 0

    latest_seen = None
    if creatives:
        latest_seen = max(c.get("last_shown", 0) for c in creatives)

    return {
        "is_advertising": is_advertising,
        "confidence": 0.9 if is_advertising else 0.2,
        "platforms": ["google"] if is_advertising else [],
        "activity_summary": (
            f"{company} has active or recent Google ads."
            if is_advertising
            else f"No recent Google ad activity detected for {company}."
        ),
        "evidence": {
            "recent_creatives_count": len(creatives),
            "latest_ad_seen": latest_seen,
        },
    }


# ------------------------------------------------------------------------------
# Entrypoint — DO NOT ADD ANYTHING ELSE
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run(transport="sse")
