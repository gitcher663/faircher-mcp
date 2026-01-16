import { z } from "zod";

export const googleAdsInputSchema = z.object({
  domain: z
    .string()
    .describe("Brand name or domain (e.g. nike.com, Coca-Cola)"),
  region: z
    .string()
    .describe("Optional region filter (e.g. US, EU).")
    .optional(),
  creative_format: z
    .enum(["text", "image", "video"])
    .describe("Optional creative format filter.")
    .optional(),
});
