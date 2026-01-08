import { observeAdsByDomain } from "../adapters/serpadsadapter";

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

  const creatives: ObservedCreative[] =
    await observeAdsByDomain(domain, period);
