import { SupabaseAdapter, EntityResolutionResponse } from "../adapters/supabase";

export type EntityResolutionInput = {
  input: string;
  source?: "user" | "crm" | "domain" | "url" | "unknown";
};

export type EntityResolution = {
  resolutionStatus: "resolved" | "ambiguous" | "unresolved";
  entityId: string | null;
  canonicalName: string | null;
  entityType: string | null;
  domains: string[];
  primaryDomain: string | null;
  location: string | null;
  description: string | null;
  sourceLinks: string[];
  kgId: string | null;
  confidence: "high" | "medium" | "low" | "unknown";
  matchedFrom: "name" | "domain" | "url" | "crm" | "user" | "unknown";
  candidates: EntityResolutionResponse["candidates"];
  confirmed: boolean;
  message: string | null;
  requiresConfirmation: boolean;
};

const supabase = new SupabaseAdapter();

function extractDomain(input: string): { domain: string; matchedFrom: "domain" | "url" } | null {
  const hasProtocol = input.startsWith("http://") || input.startsWith("https://");

  try {
    const candidateUrl = hasProtocol ? new URL(input) : new URL(`http://${input}`);
    const hostname = candidateUrl.hostname.toLowerCase();
    const cleanedHost = hostname.replace(/[^a-z0-9.-]/gi, "");

    if (!cleanedHost || !cleanedHost.includes(".")) {
      return null;
    }

    return { domain: cleanedHost, matchedFrom: hasProtocol ? "url" : "domain" };
  } catch {
    return null;
  }
}

function mapResolution(
  resolution: EntityResolutionResponse,
  matchedFrom: EntityResolution["matchedFrom"]
): EntityResolution {
  const entity = resolution.entity;

  if (!entity) {
    return {
      resolutionStatus: resolution.resolutionStatus ?? "unresolved",
      entityId: null,
      canonicalName: null,
      entityType: null,
      domains: [],
      primaryDomain: null,
      location: null,
      description: null,
      sourceLinks: [],
      kgId: null,
      confidence: "unknown",
      matchedFrom,
      candidates: resolution.candidates ?? [],
      confirmed: false,
      message: resolution.message ?? "Entity could not be resolved from provided input.",
      requiresConfirmation: true
    };
  }

  return {
    resolutionStatus: resolution.resolutionStatus ?? "resolved",
    entityId: entity.entity_id,
    canonicalName: entity.canonical_name,
    entityType: entity.entity_type,
    domains: entity.primary_domain ? [entity.primary_domain] : [],
    primaryDomain: entity.primary_domain,
    location: entity.location,
    description: entity.description,
    sourceLinks: entity.source_links ?? [],
    kgId: entity.kg_id,
    confidence: "medium",
    matchedFrom,
    candidates: resolution.candidates ?? [],
    confirmed: entity.confirmed,
    message: resolution.message ?? null,
    requiresConfirmation: true
  };
}

export async function resolveEntity(input: EntityResolutionInput): Promise<EntityResolution> {
  const trimmedInput = input.input.trim();
  const source = input.source ?? "unknown";

  if (!trimmedInput) {
    throw new Error("Input is required for entity resolution");
  }

  const domainContext = extractDomain(trimmedInput);

  if (domainContext) {
    const resolution = await supabase.persistDomainEntity(
      trimmedInput,
      domainContext.domain,
      source
    );

    return mapResolution(resolution, domainContext.matchedFrom);
  }

  const resolution = await supabase.resolveEntity(trimmedInput, source);

  if (resolution.resolutionStatus === "unresolved") {
    return mapResolution(resolution, "unknown");
  }

  return mapResolution(resolution, source === "unknown" ? "name" : source);
}
