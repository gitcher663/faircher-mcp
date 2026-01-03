from typing import Optional, Dict, Any

from fastmcp import FastMCP
from pydantic import BaseModel, Field


# ------------------------------------------------------------------------------
# Constants (explicit semantics)
# ------------------------------------------------------------------------------
ACTIVITY_ACTIVE = "active"
ACTIVITY_INACTIVE = "inactive"
ACTIVITY_UNKNOWN = "unknown"

RESULT_TYPE_AD_ACTIVITY = "ad_activity_snapshot"


# ------------------------------------------------------------------------------
# Create the MCP server
# ------------------------------------------------------------------------------
mcp = FastMCP(
    name="faircher"
)


# ------------------------------------------------------------------------------
# Input schema for the ad_activity tool
# ------------------------------------------------------------------------------
class AdActivityInput(BaseModel):
    brandName: Optional[str] = Field(
        None,
        description="Business or brand name to check advertising activity for."
    )
    domain: Optional[str] = Field(
        None,
        description="Primary website domain of the business."
    )

    class Config:
        extra = "forbid"


# ------------------------------------------------------------------------------
# ad_activity tool (read-only, single-entity)
# ------------------------------------------------------------------------------
@mcp.tool(
    name="ad_activity",
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
    """
    Read-only advertiser activity lookup.
    """

    # --------------------------------------------------------------------------
    # RULE 1: Require a brand name OR a domain
    # --------------------------------------------------------------------------
    if not input.brandName and not input.domain:
        return {
            "resultType": RESULT_TYPE_AD_ACTIVITY,
            "activityStatus": ACTIVITY_UNKNOWN,
            "confidenceScore": 0.0,
            "summaryReason": "A business name or domain is required to check advertising activity."
        }

    # --------------------------------------------------------------------------
    # RULE 2: Single-entity only (basic guard)
    # --------------------------------------------------------------------------
    for value in (input.brandName, input.domain):
        if value and "," in value:
            return {
                "resultType": RESULT_TYPE_AD_ACTIVITY,
                "activityStatus": ACTIVITY_UNKNOWN,
                "confidenceScore": 0.0,
                "summaryReason": "Only one business or domain may be queried at a time."
            }

    # --------------------------------------------------------------------------
    # Normalize inputs for backend usage (preserve raw values for output)
    # --------------------------------------------------------------------------
    raw_brand = input.brandName
    raw_domain = input.domain

    normalized_brand = raw_brand.strip().lower() if raw_brand else None
    normalized_domain = (
        raw_domain.strip().lower().removeprefix("www.")
        if raw_domain else None
    )

    # --------------------------------------------------------------------------
    # MOCK LOGIC (safe v1 stand-in for real APIs)
    #
    # Simulate "no ads found" for certain test domains
    # --------------------------------------------------------------------------
    no_ads_detected = normalized_domain in {"example.com", "noads.test"}

    if no_ads_detected:
        activity_status = ACTIVITY_INACTIVE
        platforms = []
        last_seen = None
        confidence = 0.85
        reason = (
            "No advertising activity detected across monitored platforms "
            "in the last 30 days."
        )
    else:
        activity_status = ACTIVITY_ACTIVE
        platforms = ["google", "meta"]
        last_seen = "2026-01-01"
        confidence = 0.72
        reason = "Recent ad creatives detected within the last 14 days."

    # --------------------------------------------------------------------------
    # Structured result (stable shape)
    # --------------------------------------------------------------------------
    result = {
        "resultType": RESULT_TYPE_AD_ACTIVITY,
        "brandName": raw_brand,
        "domain": raw_domain,
        "activityStatus": activity_status,
        "platformsDetected": platforms,
        "lastSeenAt": last_seen,
        "confidenceScore": confidence,
        "summaryReason": reason,
    }

    return result


# ------------------------------------------------------------------------------
# Entry point: FastMCP manages its own server
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run()
