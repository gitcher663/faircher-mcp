import type { ToolHandler } from "../../types/tool"

const SEARCHAPI_URL = "https://www.searchapi.io/api/v1/search"
const SEARCHAPI_KEY = process.env.SEARCHAPI_API_KEY

if (!SEARCHAPI_KEY) {
  throw new Error("SEARCHAPI_API_KEY is not set")
}

/**
 * advertising_activity_scan
 *
 * Determines whether a brand, business, or domain
 * is actively advertising on major paid channels.
 *
 * ChatGPT-safe, deterministic, backend-only.
 */
export const advertisingActivityScan: ToolHandler = async (input) => {
  const entity = String(input.entity).trim()
  const channel = input.channel ?? "any"
  const region = input.region ?? "ANYWHERE"

  if (!entity) {
    return {
      is_advertising: false,
      confidence: "unknown",
      reason: "No entity provided"
    }
  }

  /**
   * Internal helper for SearchAPI calls
   */
  async function callSearchApi(params: Record<string, any>) {
    const response = await fetch(SEARCHAPI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SEARCHAPI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error(`SearchAPI error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Google Ads Transparency (highest confidence)
   */
  async function checkGoogleAds() {
    const data = await callSearchApi({
      engine: "google_ads_transparency_center_advertiser_search",
      q: entity,
      region
    })

    const advertisers = Array.isArray(data.advertisers)
      ? data.advertisers
      : []

    const active = advertisers.some(
      (a: any) => a.ads_count && a.ads_count.upper > 0
    )

    return active
  }

  /**
   * Meta Ad Library
   */
  async function checkMetaAds() {
    const data = await callSearchApi({
      engine: "meta_ad_library",
      q: entity,
      active_status: "active",
      country: region === "ANYWHERE" ? "ALL" : region
    })

    const ads = Array.isArray(data.ads) ? data.ads : []
    return ads.some((ad: any) => ad.is_active === true)
  }

  /**
   * TikTok Ads Library
   */
  async function checkTikTokAds() {
    const data = await callSearchApi({
      engine: "tiktok_ads_library",
      q: entity,
      country: "all"
    })

    const ads = Array.isArray(data.ads) ? data.ads : []
    return ads.length > 0
  }

  /**
   * LinkedIn Ad Library
   */
  async function checkLinkedInAds() {
    const data = await callSearchApi({
      engine: "linkedin_ad_library",
      advertiser: entity
    })

    const ads = Array.isArray(data.ads) ? data.ads : []
    return ads.length > 0
  }

  /**
   * Execution order + short-circuiting
   */
  try {
    if (channel === "google" || channel === "any") {
      if (await checkGoogleAds()) {
        return {
          is_advertising: true,
          confidence: "high",
          reason: "Active advertiser found in Google Ads Transparency Center"
        }
      }
      if (channel === "google") {
        return {
          is_advertising: false,
          confidence: "high",
          reason: "No Google Ads activity detected"
        }
      }
    }

    if (channel === "meta" || channel === "any") {
      if (await checkMetaAds()) {
        return {
          is_advertising: true,
          confidence: "medium",
          reason: "Active ads detected in Meta Ad Library"
        }
      }
      if (channel === "meta") {
        return {
          is_advertising: false,
          confidence: "medium",
          reason: "No Meta ads detected"
        }
      }
    }

    if (channel === "tiktok" || channel === "any") {
      if (await checkTikTokAds()) {
        return {
          is_advertising: true,
          confidence: "medium",
          reason: "Ads detected in TikTok Ads Library"
        }
      }
      if (channel === "tiktok") {
        return {
          is_advertising: false,
          confidence: "medium",
          reason: "No TikTok ads detected"
        }
      }
    }

    if (channel === "linkedin" || channel === "any") {
      if (await checkLinkedInAds()) {
        return {
          is_advertising: true,
          confidence: "medium",
          reason: "Ads detected in LinkedIn Ad Library"
        }
      }
      if (channel === "linkedin") {
        return {
          is_advertising: false,
          confidence: "medium",
          reason: "No LinkedIn ads detected"
        }
      }
    }

    return {
      is_advertising: false,
      confidence: "low",
      reason: "No advertising activity detected across checked channels"
    }

  } catch (error) {
    return {
      is_advertising: false,
      confidence: "unknown",
      reason: "Error while checking advertising activity"
    }
  }
}
