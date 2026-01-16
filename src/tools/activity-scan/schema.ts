export const activityScanInputSchema = {
  type: "object",
  required: ["entity"],
  properties: {
    entity: {
      type: "string",
      description:
        "The business name, brand name, or domain to evaluate (e.g. \"Acme Corp\", \"acme.com\", \"Nike\").",
    },
    channel: {
      type: "string",
      enum: ["any", "google", "meta", "linkedin", "tiktok", "reddit"],
      default: "any",
      description:
        "Optional channel constraint. If omitted or set to \"any\", the tool will evaluate channels in priority order and stop on first positive detection.",
    },
    region: {
      type: "string",
      description: "Optional geographic focus (e.g. US, EU, global).",
    },
  },
} as const;
