export type EntityRecord = {
  entity_id: string;
  input_query: string;
  canonical_name: string;
  entity_type: string;
  primary_domain: string | null;
  description: string | null;
  location: string | null;
  source_links: string[] | null;
  kg_id: string | null;
  confirmed: boolean;
};

export type EntityCandidate = {
  canonical_name: string;
  entity_type?: string;
  primary_domain?: string | null;
  description?: string | null;
  location?: string | null;
  source_links?: string[] | null;
  kg_id?: string | null;
  confidence?: "high" | "medium" | "low";
};

export type EntityResolutionResponse = {
  resolutionStatus: "resolved" | "ambiguous" | "unresolved";
  entity: EntityRecord | null;
  candidates: EntityCandidate[];
  message?: string | null;
};

export type AdvertisingStatus = {
  advertisingStatus: "advertising_detected" | "no_recent_signals" | "unknown";
  recency: "recent" | "not_recent" | "unknown";
  confidence: "high" | "medium" | "low";
  explanation: string;
};

export type AdActivityMetric = {
  value?: number;
  valueUsd?: number;
  confidence: "high" | "medium" | "low";
};

export type AdActivity = {
  entityId: string;
  period: "recent" | "last_30_days" | "last_90_days";
  metrics: {
    spend_estimate?: AdActivityMetric;
    impression_volume?: AdActivityMetric;
    creative_count?: AdActivityMetric;
    active_channels?: string[];
    geo_coverage?: string[];
  };
  coverageNotes?: string;
  evidenceAvailable: boolean;
  confidence: "high" | "medium" | "low";
};

export class SupabaseAdapter {
  private getConfig() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase configuration missing. Set SUPABASE_URL and a service or anon key."
      );
    }

    return { supabaseUrl, supabaseKey };
  }

  private getFunctionUrl(name: string) {
    const { supabaseUrl } = this.getConfig();
    return `${supabaseUrl}/functions/v1/${name}`;
  }

  private getRestUrl(path: string) {
    const { supabaseUrl } = this.getConfig();
    return `${supabaseUrl}/rest/v1/${path}`;
  }

  private async fetchJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, init);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Supabase request failed (${response.status}): ${errorBody || response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  async resolveEntity(
    input: string,
    source: string,
    functionName = process.env.SUPABASE_FUNCTION_ENTITY_RESOLUTION ?? "resolve-entity"
  ): Promise<EntityResolutionResponse> {
    const { supabaseKey } = this.getConfig();
    const url = this.getFunctionUrl(functionName);

    const payload = { input, source };

    const result = await this.fetchJson<EntityResolutionResponse>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey
      },
      body: JSON.stringify(payload)
    });

    if (!result || !result.resolutionStatus) {
      throw new Error("Entity resolution failed: no response returned from Supabase");
    }

    return result;
  }

  async persistDomainEntity(
    input: string,
    domain: string,
    source: string,
    functionName = process.env.SUPABASE_FUNCTION_ENTITY_RESOLUTION ?? "resolve-entity"
  ): Promise<EntityResolutionResponse> {
    const { supabaseKey } = this.getConfig();
    const url = this.getFunctionUrl(functionName);

    const payload = {
      input,
      source,
      mode: "domain_fast_path",
      domain
    };

    const result = await this.fetchJson<EntityResolutionResponse>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey
      },
      body: JSON.stringify(payload)
    });

    if (!result.entity) {
      throw new Error("Domain fast-path failed to return an entity record from Supabase");
    }

    return result;
  }

  async getEntity(entityId: string): Promise<EntityRecord> {
    const { supabaseKey } = this.getConfig();
    const encodedId = encodeURIComponent(entityId);
    const url = this.getRestUrl(`entities?entity_id=eq.${encodedId}&select=*`);

    const records = await this.fetchJson<EntityRecord[]>(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey
      }
    });

    if (!records.length) {
      throw new Error(`Entity ${entityId} not found in Supabase`);
    }

    return records[0];
  }

  async confirmEntity(entityId: string): Promise<EntityRecord> {
    const { supabaseKey } = this.getConfig();
    const url = this.getRestUrl("entities");

    const payload = { confirmed: true };

    const records = await this.fetchJson<EntityRecord[]>(url + `?entity_id=eq.${encodeURIComponent(entityId)}&select=*`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey
      },
      body: JSON.stringify(payload)
    });

    if (!records.length) {
      throw new Error(`Unable to confirm entity ${entityId}`);
    }

    return records[0];
  }

  async getAdvertisingStatus(
    entityId: string,
    functionName = process.env.SUPABASE_FUNCTION_ADVERTISING_STATUS ?? "resolve-advertising-status"
  ): Promise<AdvertisingStatus> {
    const { supabaseKey } = this.getConfig();
    const url = this.getFunctionUrl(functionName);

    const result = await this.fetchJson<AdvertisingStatus>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey
      },
      body: JSON.stringify({ entityId })
    });

    if (!result) {
      throw new Error("Advertising status response is empty");
    }

    return result;
  }

  async getAdActivity(
    entityId: string,
    metrics: string[] = [],
    period: "recent" | "last_30_days" | "last_90_days" = "recent",
    functionName = process.env.SUPABASE_FUNCTION_AD_ACTIVITY ?? "get-ad-activity"
  ): Promise<AdActivity> {
    const entity = await this.getEntity(entityId);

    if (!entity.confirmed) {
      throw new Error(
        "Advertising activity is blocked until the entity has been explicitly confirmed by the user."
      );
    }

    const { supabaseKey } = this.getConfig();
    const url = this.getFunctionUrl(functionName);

    const result = await this.fetchJson<AdActivity>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey
      },
      body: JSON.stringify({ entityId, metrics, period })
    });

    if (!result || !result.evidenceAvailable) {
      throw new Error("Supabase did not return advertising activity for the confirmed entity");
    }

    return result;
  }
}
