import { z } from "zod";

export const checkAdvertisingActivity = [
  "advertising.activity_lookup",
  {
    title: "Check advertising activity",
    description:
      "Looks up advertising activity using the Google Ads Transparency Center.",
    inputSchema: {
      domain: z.string(),
      region: z.string().optional(),
      creative_format: z.enum(["text", "image", "video"]).optional(),
    },
  },
  async ({ domain, region, creative_format }) => {
    const params = new URLSearchParams({
      engine: "google_ads_transparency_center",
      text: domain, // ← THIS IS CORRECT PER SERPAPI
      api_key: process.env.SERPAPI_API_KEY!,
    });

    if (region) params.set("region", region);
    if (creative_format) params.set("creative_format", creative_format);

    const res = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error(`SerpApi request failed: ${res.status}`);
    }

    const data = await res.json();

    return {
      structuredContent: {
        domain,
        ads_found: data.ad_creatives?.length ?? 0,
      },
      content: [
        {
          type: "text",
          text: `Advertising activity for ${domain}`,
        },
      ],
      _meta: {
        ad_creatives: data.ad_creatives ?? [],
        pagination: data.serpapi_pagination ?? null,
      },
    };
  },
] as const;
