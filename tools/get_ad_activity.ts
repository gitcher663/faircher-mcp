export type AdvertisingStatus = {
  domain: string;
  advertisingDetected: boolean;
  recency: "recent" | "not_recent" | "unknown";
  explanation: string;
};

export type AdActivityMetric = {
  value?: number;
  valueUsd?: number;
};

export type AdActivity = {
  domain: string;
  period: "recent" | "last_30_days" | "last_90_days";
  metrics: {
    spend_estimate?: AdActivityMetric;
    impression_volume?: AdActivityMetric;
    creative_count?: AdActivityMetric;
    active_channels?: string[];
    geo_coverage?: string[];
  };
  evidenceAvailable: boolean;
  evidenceNotes?: string;
};

export class SupabaseAdapter {
  private getConfig() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    return { supabaseUrl, supabaseKey };
  }

  private getFunctionUrl(functionName: string) {
    const { supabaseUrl } = this.getConfig();
    return `${supabaseUrl}/functions/v1/${functionName}`;
  }

  private async fetchJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, init);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Supabase request failed (${response.status}): ${body || response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  async getAdvertisingStatusForDomain(
    domain: string,
    functionName = "advertising-status-for-domain"
  ): Promise<AdvertisingStatus> {
    const { supabaseKey } = this.getConfig();

    return this.fetchJson<AdvertisingStatus>(
      this.getFunctionUrl(functionName),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey
        },
        body: JSON.stringify({ domain })
      }
    );
  }

  async getAdActivityForDomain(
    domain: string,
    period: "recent" | "last_30_days" | "last_90_days" = "recent",
    metrics: string[] = [],
    functionName = "get-ad-activity-for-domain"
  ): Promise<AdActivity | null> {
    const { supabaseKey } = this.getConfig();

    return this.fetchJson<AdActivity | null>(
      this.getFunctionUrl(functionName),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey
        },
        body: JSON.stringify({
          domain,
          period,
          metrics
        })
      }
    );
  }
}
