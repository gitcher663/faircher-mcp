export const googleAdsInputSchema = {
  type: "object",
  required: ["domain"],
  properties: {
    domain: {
      type: "string",
      description: "Brand name or domain (e.g. nike.com, Coca-Cola)",
    },
    region: {
      type: "string",
      description: "Optional region filter (e.g. US, EU).",
    },
    creative_format: {
      type: "string",
      enum: ["text", "image", "video"],
      description: "Optional creative format filter.",
    },
  },
} as const;
