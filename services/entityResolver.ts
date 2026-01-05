import { SerpApiAdapter } from "../adapters/serpapi";

export type EntityResolutionInput = {
  input: string;
  source?: "user" | "crm" | "domain" | "url" | "unknown";
};

export type EntityResolution = {
  resolutionStatus: "resolved" | "ambiguous" | "not_found";
  entityId: string | null;
  canonicalName: string | null;
  entityType: "advertiser" | "unknown";
  domains: string[];
  primaryDomain: string | null;
  confidence: "high" | "medium" | "low";
  matchedFrom: "name" | "domain" | "url" | "crm" | "unknown";
  candidates: Array<{ id: string; name: string; domain?: string; confidence: "high" | "medium" | "low" }>;
  message: string | null;
};

const serpApi = new SerpApiAdapter();

export async function resolveEntity(input: EntityResolutionInput): Promise<EntityResolution> {
  const serpResult = await serpApi.searchEntity(input.input);

  if (!serpResult) {
    return {
      resolutionStatus: "not_found",
      entityId: null,
      canonicalName: null,
      entityType: "unknown",
      domains: [],
      primaryDomain: null,
      confidence: "low",
      matchedFrom: "unknown",
      candidates: [],
      message: "No matching entity found"
    };
  }

  return {
    resolutionStatus: serpResult.candidates.length > 1 ? "ambiguous" : "resolved",
    entityId: serpResult.primaryCandidate.id,
    canonicalName: serpResult.primaryCandidate.name,
    entityType: "advertiser",
    domains: serpResult.candidates.map((candidate) => candidate.domain).filter(Boolean) as string[],
    primaryDomain: serpResult.primaryCandidate.domain ?? null,
    confidence: serpResult.primaryCandidate.confidence,
    matchedFrom: serpResult.matchedFrom,
    candidates: serpResult.candidates,
    message:
      serpResult.candidates.length > 1
        ? "Multiple potential matches found. Choose the closest match or provide additional context."
        : null
  };
}
