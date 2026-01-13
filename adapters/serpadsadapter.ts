import type {
  ObservedCreative,
  AdPlacement
} from "../services/adActivity";

/**
 * SERP Ads Observation Adapter (MCP-safe)
 *
 * Responsibility:
 * - Call SERPAPI (bounded, timeout-enforced)
 * - Observe *ads* (not entities)
 * - Normalize results into ObservedCreative[]
 *
 * MCP guarantees:
 * - Hard timeout
 * - No unbounded awaits
 * - Always resolves or throws deterministically
 */
export async function observeAdsByDomain(
  domain: string,
  period: "recent" | "last_30_days" | "last_90_days"
): Promise<ObservedCreative[]> {
  console.log(
    "[SERP ADS ADAPTER] invoked for domain:",
    domain,
    "period:",
    period
  );

  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.error("[SERP ADS ADAPTER] missing SERPAPI_API_KEY");
    throw new Error("Missing SERPAPI_API_KEY environment variable");
  }

  /**
   * Conservative starting point:
   * Google Search Ads only.
   */
  const query = `site:${domain}`;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");
  url.searchParams.set("api_key", apiKey);

  console.log("[SERP ADS ADAPTER] calling SERPAPI:", url.toString());

  // --- HARD TIMEOUT (CRITICAL FOR MCP) ---
  const controller = new AbortController();
  const timeoutMs = 8000; // 8s max — safe for ChatGPT tools
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      signal: controller.signal
    });
  } catch (err) {
    console.error(
      "[SERP ADS ADAPTER] SERPAPI fetch failed or timed out:",
      err
    );
    throw new Error("SERPAPI request failed or timed out");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(
      "[SERP ADS ADAPTER] SERPAPI request failed:",
      response.status,
      text
    );
    throw new Error(
      `SERPAPI request failed (${response.status})`
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    console.error("[SERP ADS ADAPTER] invalid JSON response:", err);
    throw new Error("Invalid JSON returned by SERPAPI");
  }

  /**
   * SERPAPI text ads are typically returned under `ads`
   */
  const ads = Array.isArray(json?.ads) ? json.ads : [];

  console.log("[SERP ADS ADAPTER] ads returned:", ads.length);

  const now = new Date().toISOString();

  const creatives: ObservedCreative[] = ads
    .filter((ad: any) => typeof ad?.link === "string")
    .map((ad: any) => {
      const placement: AdPlacement = "search";

      return {
        placement,
        headline: typeof ad.title === "string" ? ad.title : undefined,
        description:
          typeof ad.description === "string"
            ? ad.description
            : undefined,
        landingPage: ad.link,
        firstSeen: now,
        lastSeen: now
      };
    });

  console.log(
    "[SERP ADS ADAPTER] creatives normalized:",
    creatives.length
  );

  return creatives;
}
