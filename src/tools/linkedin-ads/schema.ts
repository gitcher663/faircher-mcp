import { z } from "zod";

export const linkedinAdsInputSchema = z.object({
  entity: z.string().describe("Brand name or domain to evaluate."),
  region: z
    .string()
    .describe("Optional region filter (e.g. US, EU).")
    .optional(),
});
