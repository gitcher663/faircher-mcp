import { googleAdsInputSchema } from "./schema.js";

export const googleAdsTool = {
  // Keep the tool scoped to Google Ads
  name: "google_ads.activity_lookup",

  definition: {
    title: "Check Google Ads activity",
    description:
      "Checks for advertising activity on Google Ads using the Google Ads Transparency Center Advertiser Search (SearchAPI).",
    inputSchema: googleAdsInputSchema,
    annotations: {
      title: "Check Google Ads activity",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  async handler(args: {
    domain: string;
    region?: string;
  }) {
    if (!process.env.SEARCHAPI_API_KEY) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: "SEARCHAPI_API_KEY is not configured for Google Ads lookup.",
          },
        ],
        _meta: {
          channel: "google_ads",
          signal: "unknown",
        },
      };
    }

    const params = new URLSearchParams({
      engine: "google_ads_transparency_center_advertiser_search",
      q: args.domain,
      api_key: process.env.SEARCHAPI_API_KEY,
    });

    if (args.region) {
      params.set("region", args.region);
    }

    const response = await fetch(
      `https://www.searchapi.io/api/v1/search?${params.toString()}`
    );

    if (!response.ok) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `SearchAPI Google Ads request failed (${response.status}).`,
          },
        ],
        _meta: {
          channel: "google_ads",
          signal: "unknown",
        },
      };
    }

    const data = await response.json();

    const advertisers = Array.isArray(data.advertisers)
      ? data.advertisers
      : [];

    /**
     * Presence detection rule:
     * If any advertiser has ads_count.upper > 0,
     * we treat Google Ads activity as detected.
     */
    const hasActivity = advertisers.some(
      (adv: any) => adv.ads_count && adv.ads_count.upper > 0
    );

    return {
      content: [
        {
          type: "text" as const,
          text: hasActivity
            ? "Yes — advertising activity detected on Google Ads."
            : "No advertising signal detected on Google Ads.",
        },
      ],
      _meta: {
        channel: "google_ads",
        signal: hasActivity ? "detected" : "none",
        advertisers: advertisers.map((adv: any) => ({
          name: adv.name,
          id: adv.id,
          region: adv.region,
          ads_count: adv.ads_count,
          is_verified: adv.is_verified,
        })),
      },
    };
  },
};
