import fetch from "node-fetch";
import type {
  ObservedCreative,
  AdPlacement
} from "../services/adActivity";

/**
 * SERP Ads Observation Adapter
 *
 * Responsibility:
 * - Call SERPAPI
 * - Observe *ads* (not entities)
 * - Normalize results into ObservedCreative[]
 *
 * Non-responsibilities:
 * - Entity resolution
 * - Persistence
 * - Confidence scoring
 * - Supabase access
 */
export async function observeAdsByDomain(
  domain: string,
  period: "recent" | "last_30_days" | "last_90_days"
): Promise<ObservedCreative[]> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SERPAPI_API_KEY environment variable");
  }

  /**
   * Conservative starting point:
   * Google Search Ads only.
   * We do NOT claim display, shopping, or social yet.
   */
  const query = `site:${domain}`;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `SERPAPI request failed (${response.status}): ${text}`
    );
  }

  const json = await response.json();

  /**
   * SERPAPI text ads are typically returned under `ads`
   * We intentionally ignore all other sections for now.
   */
  const ads = Array.isArray(json.ads) ? json.ads : [];

  const now = new Date().toISOString();

  const creatives: ObservedCreative[] = ads
    .filter((ad: any) => typeof ad.link === "string")
    .map((ad: any) => {
      const placement: AdPlacement = "search";

      return {
        placement,
        headline: ad.title,
        description: ad.description,
        landingPage: ad.link,
        firstSeen: now,
        lastSeen: now
      };
    });

  return creatives;
}
