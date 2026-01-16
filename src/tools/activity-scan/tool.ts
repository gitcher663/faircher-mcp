import { activityScanInputSchema } from "./schema.js";

const SEARCHAPI_URL = "https://www.searchapi.io/api/v1/search";
const SEARCHAPI_KEY = process.env.SEARCHAPI_API_KEY;

type ActivityScanArgs = {
  entity: string;
  channel?: "any" | "google" | "meta" | "linkedin" | "tiktok" | "reddit";
  region?: string;
};

/**
 * advertising_activity_scan
 *
 * Determines whether a brand, business, or domain
 * is actively advertising on major paid channels.
 *
 * ChatGPT-safe, deterministic, backend-only.
 */
export const activityScanTool = {
  name: "ad_intelligence",

  definition: {
    title: "Advertising activity scan",
    description:
      "Determines whether a brand, business, or domain is actively advertising across major paid channels.",
    inputSchema: activityScanInputSchema,
  },

  async handler(args: ActivityScanArgs) {
    const entity = String(args.entity ?? "").trim();
    const channel = args.channel ?? "any";
    const region = args.region ?? "ANYWHERE";

    if (!entity) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No entity provided for advertising activity scan.",
          },
        ],
        _meta: {
          is_advertising: false,
          channels_detected: [],
          confidence: "unknown",
          evidence_summary: "No entity provided.",
        },
      };
    }

    if (!SEARCHAPI_KEY) {
      return {
        content: [
          {
            type: "text" as const,
            text: "SearchAPI key is not configured for the activity scan tool.",
          },
        ],
        _meta: {
          is_advertising: false,
          channels_detected: [],
          confidence: "unknown",
          evidence_summary: "SEARCHAPI_API_KEY is not set.",
        },
      };
    }

    async function callSearchApi(params: Record<string, unknown>) {
      const response = await fetch(SEARCHAPI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SEARCHAPI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`SearchAPI error: ${response.status}`);
      }

      return response.json();
    }

    async function checkGoogleAds() {
      const data = await callSearchApi({
        engine: "google_ads_transparency_center_advertiser_search",
        q: entity,
        region,
      });

      const advertisers = Array.isArray(data.advertisers)
        ? data.advertisers
        : [];

      return advertisers.some(
        (advertiser: { ads_count?: { upper?: number } }) =>
          Boolean(advertiser.ads_count?.upper && advertiser.ads_count.upper > 0)
      );
    }

    async function checkMetaAds() {
      const data = await callSearchApi({
        engine: "meta_ad_library",
        q: entity,
        active_status: "active",
        country: region === "ANYWHERE" ? "ALL" : region,
      });

      const ads = Array.isArray(data.ads) ? data.ads : [];
      return ads.some((ad: { is_active?: boolean }) => ad.is_active === true);
    }

    async function checkTikTokAds() {
      const data = await callSearchApi({
        engine: "tiktok_ads_library",
        q: entity,
        country: "all",
      });

      const ads = Array.isArray(data.ads) ? data.ads : [];
      return ads.length > 0;
    }

    async function checkLinkedInAds() {
      const data = await callSearchApi({
        engine: "linkedin_ad_library",
        advertiser: entity,
      });

      const ads = Array.isArray(data.ads) ? data.ads : [];
      return ads.length > 0;
    }

    const channelsDetected: string[] = [];
    let confidence: "high" | "medium" | "low" | "unknown" = "low";
    let evidenceSummary =
      "No advertising activity detected across checked channels.";

    try {
      if (channel === "google" || channel === "any") {
        if (await checkGoogleAds()) {
          channelsDetected.push("google");
          confidence = "high";
          evidenceSummary =
            "Active advertiser found in Google Ads Transparency Center.";
        } else if (channel === "google") {
          confidence = "high";
          evidenceSummary = "No Google Ads activity detected.";
        }
      }

      if (channel === "meta" || channel === "any") {
        if (await checkMetaAds()) {
          channelsDetected.push("meta");
          confidence = "medium";
          evidenceSummary = "Active ads detected in Meta Ad Library.";
        } else if (channel === "meta") {
          confidence = "medium";
          evidenceSummary = "No Meta ads detected.";
        }
      }

      if (channel === "tiktok" || channel === "any") {
        if (await checkTikTokAds()) {
          channelsDetected.push("tiktok");
          confidence = "medium";
          evidenceSummary = "Ads detected in TikTok Ads Library.";
        } else if (channel === "tiktok") {
          confidence = "medium";
          evidenceSummary = "No TikTok ads detected.";
        }
      }

      if (channel === "linkedin" || channel === "any") {
        if (await checkLinkedInAds()) {
          channelsDetected.push("linkedin");
          confidence = "medium";
          evidenceSummary = "Ads detected in LinkedIn Ad Library.";
        } else if (channel === "linkedin") {
          confidence = "medium";
          evidenceSummary = "No LinkedIn ads detected.";
        }
      }

      if (channel === "reddit") {
        confidence = "low";
        evidenceSummary = "Reddit ads detection is not implemented.";
      }
    } catch (error) {
      confidence = "unknown";
      evidenceSummary = "Error while checking advertising activity.";
    }

    const isAdvertising = channelsDetected.length > 0;

    return {
      content: [
        {
          type: "text" as const,
          text: isAdvertising
            ? `Advertising activity detected for ${entity} on ${channelsDetected.join(
                ", "
              )}.`
            : `No advertising activity detected for ${entity}.`,
        },
      ],
      _meta: {
        is_advertising: isAdvertising,
        channels_detected: channelsDetected,
        confidence,
        evidence_summary: evidenceSummary,
      },
    };
  },
};
