export type AdPlacement =
  | "search"
  | "display"
  | "video"
  | "shopping"
  | "social"
  | "unknown";

export type ObservedCreative = {
  placement: AdPlacement;
  headline?: string;
  description?: string;
  landingPage: string;
  firstSeen: string;
  lastSeen: string;
};

export type AdActivity = {
  domain: string;
  period: "recent" | "last_30_days" | "last_90_days";

  evidenceAvailable: boolean;
  confidence: "high" | "medium" | "low";

  placements: AdPlacement[];
  platforms: string[];

  creativesObserved: number;
  sampleCreatives: ObservedCreative[];

  geoCoverage: string[];

  firstSeen: string;
  lastSeen: string;
};

export type GetAdActivityInput = {
  domain: string;
  period?: "recent" | "last_30_days" | "last_90_days";
};

/**
 * Adapter boundary.
 * This will later be implemented by:
 *   - SERPAPI
 *   - other ad observation sources
 */
async function observeAdsByDomain(
  domain: string,
  period: "recent" | "last_30_days" | "last_90_days"
): Promise<ObservedCreative[]> {
  /**
   * TEMPORARY STUB
   * ----------------
   * This returns placeholder observations so that:
   * - MCP plumbing can be validated
   * - The AdActivity contract remains stable
   *
   * Replace ONLY this function body when wiring SERPAPI.
   */

  const now = new Date().toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  return [
    {
      placement: "search",
      headline: "Brake Service Near You",
      description: "Trusted auto repair services",
      landingPage: `https://${domain}/offers`,
      firstSeen: sevenDaysAgo,
      lastSeen: now
    },
    {
      placement: "video",
      landingPage: `https://${domain}`,
      firstSeen: sevenDaysAgo,
      lastSeen: now
    }
  ];
}

export async function getAdActivity(
  input: GetAdActivityInput
): Promise<AdActivity> {
  const domain = input.domain?.trim();

  if (!domain) {
    throw new Error("Missing required input: domain");
  }

  const period = input.period ?? "recent";

  /**
   * Core rule:
   * This service assembles evidence.
   * It does NOT guess spend, reach, or impressions.
   */

  const creatives = await observeAdsByDomain(domain, period);

  const placements = Array.from(
    new Set(creatives.map(c => c.placement))
  );

  const firstSeen =
    creatives.length > 0
      ? creatives.reduce(
          (min, c) => (c.firstSeen < min ? c.firstSeen : min),
          creatives[0].firstSeen
        )
      : null;

  const lastSeen =
    creatives.length > 0
      ? creatives.reduce(
          (max, c) => (c.lastSeen > max ? c.lastSeen : max),
          creatives[0].lastSeen
        )
      : null;

  return {
    domain,
    period,

    evidenceAvailable: creatives.length > 0,
    confidence: creatives.length > 0 ? "high" : "low",

    placements,
    platforms: creatives.length > 0 ? ["google"] : [],

    creativesObserved: creatives.length,
    sampleCreatives: creatives.slice(0, 5),

    geoCoverage: creatives.length > 0 ? ["US"] : [],

    firstSeen: firstSeen ?? new Date().toISOString(),
    lastSeen: lastSeen ?? new Date().toISOString()
  };
}
