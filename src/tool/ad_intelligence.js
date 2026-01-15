import { serpapiSearch } from "../providers/serpapi.js";

/**
 * FairCher Ad Intelligence Tool
 * ----------------------------
 * High-level orchestration across ad channels.
 * Providers are implementation details.
 */
export async function adIntelligenceTool(input) {
  const { entity, channels = ["search", "display"] } = input;

  if (!entity) {
    throw new Error("ad_intelligence requires an `entity` (brand or domain)");
  }

  const results = {};

  for (const channel of channels) {
    switch (channel) {
      case "search":
      case "display":
        results[channel] = await serpapiSearch({
          query: entity,
          engine: "google_ads_transparency_center"
        });
        break;

      case "social":
      case "streaming":
      case "broadcast":
        // Placeholder for future providers
        results[channel] = {
          provider: "unavailable",
          message: `Data source for ${channel} is not yet integrated`
        };
        break;

      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  return {
    entity,
    channels,
    results
  };
}
