import { tiktokAdsInputSchema } from "./schema.js";

export const tiktokAdsTool = {
  name: "tiktok_ads_lookup",

  definition: {
    title: "TikTok ads lookup",
    description: "Placeholder for TikTok Ads activity detection.",
    inputSchema: tiktokAdsInputSchema,
    annotations: {
      title: "TikTok ads lookup",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },

  async handler(args: { entity: string; region?: string }) {
    return {
      content: [
        {
          type: "text" as const,
          text: `TikTok ads lookup for ${args.entity} is not implemented yet.`,
        },
      ],
      _meta: {
        TODO: "Implement TikTok ads detection.",
      },
    };
  },
};
