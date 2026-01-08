import { observeAdsByDomain } from "../adapters/serpAdsAdapter";

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

  firstSeen: string | null;
  lastSeen: string | null;
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

  // 🔴 THIS IS NOW THE REAL SERPAPI CALL PATH
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
    platforms: placements.length > 0 ? ["google"] : [],

    creativesObserved: creatives.length,
    sampleCreatives: creatives.slice(0, 5),

    geoCoverage: creatives.length > 0 ? ["US"] : [],

    firstSeen,
    lastSeen
  };
}
