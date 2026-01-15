import { z } from "zod";

export const checkAdvertisingActivity = {
  name: "advertising.activity_lookup",

  definition: {
    title: "Check advertising activity",
    description:
      "Looks up advertising activity using the Google Ads Transparency Center.",
    inputSchema: {
      domain: z.string(),
      region: z.string().optional(),
      creative_format: z.enum(["text", "image", "video"]).optional(),
    },
  },

  async handler(args: {
    domain: string;
    region?: string;
    creative_format?: "text" | "image" | "video";
  }) {
    const params = new URLSearchParams({
      engine: "google_ads_transparency_center",
      text: args.domain,
      api_key: process.env.SERPAPI_API_KEY!,
    });

    if (args.region) params.set("region", args.region);
    if (args.creative_format) {
      params.set("creative_format", args.creative_format);
    }

    const res = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    const data = await res.json();

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${data.ad_creatives?.length ?? 0} ads for ${args.domain}`,
        },
      ],
      _meta: {
        ad_creatives: data.ad_creatives ?? [],
        pagination: data.serpapi_pagination ?? null,
      },
    };
  },
};
