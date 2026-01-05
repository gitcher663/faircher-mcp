export type SerpApiCandidate = {
  id: string;
  name: string;
  domain?: string;
  confidence: "high" | "medium" | "low";
};

export type SerpApiResult = {
  primaryCandidate: SerpApiCandidate;
  candidates: SerpApiCandidate[];
  matchedFrom: "name" | "domain" | "url" | "crm" | "unknown";
};

export class SerpApiAdapter {
  async searchEntity(query: string): Promise<SerpApiResult | null> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return null;
    }

    const normalizedDomain = trimmedQuery
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .toLowerCase();

    const canonicalDomain = normalizedDomain.includes(".") ? normalizedDomain : `${normalizedDomain}.com`;

    const candidate: SerpApiCandidate = {
      id: `fc_ent_${Buffer.from(canonicalDomain).toString("hex").slice(0, 8)}`,
      name: trimmedQuery,
      domain: canonicalDomain,
      confidence: "medium"
    };

    return {
      primaryCandidate: candidate,
      candidates: [candidate],
      matchedFrom: normalizedDomain.includes("http") ? "url" : "name"
    };
  }
}
