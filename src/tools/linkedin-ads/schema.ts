export const linkedinAdsInputSchema = {
  type: "object",
  required: ["entity"],
  properties: {
    entity: {
      type: "string",
      description: "Brand name or domain to evaluate.",
    },
    region: {
      type: "string",
      description: "Optional region filter (e.g. US, EU).",
    },
  },
} as const;
