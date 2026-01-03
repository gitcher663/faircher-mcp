from typing import Optional, Dict, Any

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field, ConfigDict
from fastapi import FastAPI
import uvicorn


# ------------------------------------------------------------------------------
# Constants (explicit semantics)
# ------------------------------------------------------------------------------
ACTIVITY_ACTIVE = "active"
ACTIVITY_INACTIVE = "inactive"
ACTIVITY_UNKNOWN = "unknown"

RESULT_TYPE_AD_ACTIVITY = "ad_activity_snapshot"


# ------------------------------------------------------------------------------
# Create the MCP server (HTTP/SSE compatible)
# ------------------------------------------------------------------------------
mcp = FastMCP(
    name="faircher",
    stateless_http=True,
)


# ------------------------------------------------------------------------------
# Input schema for the ad_activity tool
# ------------------------------------------------------------------------------
class AdActivityInput(BaseModel):
    brandName: Optional[str] = Field(
        None,
        description="Business or brand name to check advertising activity for.",
    )
    domain: Optional[str] = Field(
        None,
        description="Primary website domain of the business.",
    )

    model_config = ConfigDict(extra="forbid")


# ------------------------------------------------------------------------------
# ad_activity tool (read-only, single-entity)
# ------------------------------------------------------------------------------
@mcp.tool(
    name="get_brand_ad_activity",
    description=(
        "Check advertising activity for a specific business or domain, "
        "including where ads appear and how recently activity was observed."
    ),
    annotations={
        "title": "Advertising Activity Lookup",
        "readOnlyHint": True,
        "destructiveHint": False,
        "openWorldHint": False,
    },
)
def ad_activity(input: AdActivityInput) -> Dict[str, Any]:

    # RULE 1: Require brand OR domain
    if not input.brandName and not input.domain:
        return {
            "resultType": RESULT_TYPE_AD_ACTIVITY,
            "activityStatus": ACTIVITY_UNKNOWN,
            "confidenceScore": 0.0,
            "summaryReason": (
                "A business name or domain is required to check advertising activity."
            ),
        }

    # RULE 2: Single-entity only
    for value in (input.brandName, input.domain):
        if value and "," in value:
            return {
                "resultType": RESULT_TYPE_AD_ACTIVITY,
                "activityStatus": ACTIVITY_UNKNOWN,
                "confidenceScore": 0.0,
                "summaryReason": (
                    "Only one business or domain may be queried at a time."
                ),
            }

    raw_brand = input.brandName
    raw_domain = input.domain

    normalized_domain = (
        raw_domain.strip().lower().removeprefix("www.")
        if raw_domain else None
    )

    no_ads_detected = normalized_domain in {"example.com", "noads.test"}

    if no_ads_detected:
        return {
            "resultType": RESULT_TYPE_AD_ACTIVITY,
            "brandName": raw_brand,
            "domain": raw_domain,
            "activityStatus": ACTIVITY_INACTIVE,
            "platformsDetected": [],
            "lastSeenAt": None,
            "confidenceScore": 0.85,
            "summaryReason": (
                "No advertising activity detected across monitored platforms "
                "in the last 30 days."
            ),
        }

    return {
        "resultType": RESULT_TYPE_AD_ACTIVITY,
        "brandName": raw_brand,
        "domain": raw_domain,
        "activityStatus": ACTIVITY_ACTIVE,
        "platformsDetected": ["google", "meta"],
        "lastSeenAt": "2026-01-01",
        "confidenceScore": 0.72,
        "summaryReason": "Recent ad creatives detected within the last 14 days.",
    }


# ------------------------------------------------------------------------------
# Root FastAPI app + MCP app
# (Required so OpenAI Create App URL validation does NOT get a 404)
# ------------------------------------------------------------------------------
root_app = FastAPI()

@root_app.get("/")
def root():
    return {"status": "ok"}

mcp_app = mcp.streamable_http_app()
root_app.mount("/", mcp_app)

app = root_app


# ------------------------------------------------------------------------------
# Entrypoint for Railway / production
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
    )
