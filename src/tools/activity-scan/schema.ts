import { z } from "zod";

export const activityScanInputSchema = z.object({
  entity: z
    .string()
    .describe(
      "The business name, brand name, or domain to evaluate (e.g. \"Acme Corp\", \"acme.com\", \"Nike\")."
    ),
  channel: z
    .enum(["any", "google", "meta", "linkedin", "tiktok", "reddit"])
    .default("any")
    .describe(
      "Optional channel constraint. If omitted or set to \"any\", the tool will evaluate channels in priority order and stop on first positive detection."
    ),
  region: z
    .string()
    .describe("Optional geographic focus (e.g. US, EU, global).")
    .optional(),
});
