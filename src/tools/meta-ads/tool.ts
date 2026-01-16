import { metaAdsInputSchema } from "./schema.js";

export const metaAdsTool = {
  name: "meta_ads_lookup",

  definition: {
    title: "Meta ads lookup",
    description: "Placeholder for Meta Ads activity detection.",
    inputSchema: metaAdsInputSchema,
    annotations: {
      title: "Meta ads lookup",
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
          text: `Meta ads lookup for ${args.entity} is not implemented yet.`,
        },
      ],
      _meta: {
        TODO: "Implement Meta ads detection.",
      },
    };
  },
};
