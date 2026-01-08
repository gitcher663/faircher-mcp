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

export async function getAdActivity(
  input: GetAdActivityInput
): Promise<AdActivity> {
  const domain = input.domain?.trim();

  if (!domain) {
    throw new Error("Missing required input: domain");
  }

  const period = input.period ?? "recent";

  /**
   * NOTE:
   * This service currently returns stubbed, SERP-style
   * advertising evidence. It intentionally does NOT
   * fabricate spend, impressions, or reach.
   *
   * Replace the block below with calls to:
   *   - SupabaseAdapter
   *   - SERP / ads observation adapters
   *
   * The shape of the output should remain stable.
   */

  const now = new Date().toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const sampleCreatives: ObservedCreative[] = [
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

  return {
    domain,
    period,

    evidenceAvailable: sampleCreatives.length > 0,
    confidence: "high",

    placements: Array.from(
      new Set(sampleCreatives.map(c => c.placement))
    ),

    platforms: ["google"],

    creativesObserved: sampleCreatives.length,
    sampleCreatives,

    geoCoverage: ["US"],

    firstSeen: sevenDaysAgo,
    lastSeen: now
  };
}
