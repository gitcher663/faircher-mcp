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

const DEFAULT_METRIC_SET = [
  "spend_estimate",
  "impression_volume",
  "creative_count",
  "active_channels",
  "geo_coverage"
] as const;

type MetricKey = (typeof DEFAULT_METRIC_SET)[number];

export class SupabaseAdapter {
  async getAdvertisingStatus(entityId: string): Promise<AdvertisingStatus> {
    const confidence = entityId.length > 0 ? "medium" : "low";

    return {
      advertisingStatus: "advertising_detected",
      recency: "recent",
      confidence,
      explanation:
        "Advertising signals detected within the evaluated period across monitored digital channels."
    };
  }

  async getAdActivity(
    entityId: string,
    metrics: string[] = [...DEFAULT_METRIC_SET],
    period: "recent" | "last_30_days" | "last_90_days" = "recent"
  ): Promise<AdActivity> {
    const requestedMetrics = metrics.length ? metrics : [...DEFAULT_METRIC_SET];

    const metricSet: AdActivity["metrics"] = {};

    requestedMetrics.forEach((metric) => {
      if (!DEFAULT_METRIC_SET.includes(metric as MetricKey)) {
        return;
      }

      switch (metric) {
        case "spend_estimate":
          metricSet.spend_estimate = { valueUsd: 125000, confidence: "medium" };
          break;
        case "impression_volume":
          metricSet.impression_volume = { value: 4200000, confidence: "medium" };
          break;
        case "creative_count":
          metricSet.creative_count = { value: 87, confidence: "high" };
          break;
        case "active_channels":
          metricSet.active_channels = ["search", "social", "video"];
          break;
        case "geo_coverage":
          metricSet.geo_coverage = ["US"];
          break;
      }
    });

    return {
      entityId,
      period,
      metrics: metricSet,
      coverageNotes: "Metric availability and precision vary by channel, geography, and entity.",
      evidenceAvailable: true,
      confidence: "medium"
    };
  }
}
