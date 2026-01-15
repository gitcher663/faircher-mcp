import { z } from "zod";

export const checkAdvertisingActivity: [
  string,
  any,
  (args: any) => Promise<any>
] = [
  "check_advertising_activity",
  {
    title: "Check advertising activity",
    description:
      "Checks Google Ads Transparency Center for advertising activity related to a domain",
    inputSchema: {
      domain: z.string(),
      region: z.string().optional(),
      creative_format: z.enum(["text", "image", "video"]).optional(),
    },
  },

  async ({ domain, region, creative_format }) => {
    const params = new URLSearchParams({
      engine: "google_ads_transparency_center",
      text: domain,
      api_key: process.env.SERPAPI_API_KEY!,
    });

    if (region) params.set("region", region);
    if (creative_format) params.set("creative_format", creative_format);

    const res = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );
    const data = await res.json();

    return {
      structuredContent: {
        domain,
        ads_found: data.ad_creatives?.length ?? 0,
      },
      content: [
        {
          type: "text",
          text: `Advertising activity found for ${domain}`,
        },
      ],
      _meta: {
        ad_creatives: data.ad_creatives ?? [],
        pagination: data.serpapi_pagination ?? null,
      },
    };
  },
];
