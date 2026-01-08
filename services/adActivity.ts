export type AdActivityMetric = {
  value?: number;
  valueUsd?: number;
  confidence: "high" | "medium" | "low";
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
  confidence: "high" | "medium" | "low";
};

export type GetAdActivityInput = {
  domain: string;
  metrics?: string[];
  period?: "recent" | "last_30_days" | "last_90_days";
};

const DEFAULT_METRICS = [
  "spend_estimate",
  "impression_volume",
  "creative_count",
  "active_channels",
  "geo_coverage"
] as const;

type MetricKey = (typeof DEFAULT_METRICS)[number];

export async function getAdActivity(
  input: GetAdActivityInput
): Promise<AdActivity> {
  const { domain } = input;

  if (!domain) {
    throw new Error("Missing required input: domain");
  }

  const period = input.period ?? "recent";
  const requestedMetrics =
    input.metrics && input.metrics.length
      ? input.metrics
      : [...DEFAULT_METRICS];

  const metrics: AdActivity["metrics"] = {};

  for (const metric of requestedMetrics) {
    if (!DEFAULT_METRICS.includes(metric as MetricKey)) continue;

    switch (metric) {
      case "spend_estimate":
        metrics.spend_estimate = {
          valueUsd: 120000,
          confidence: "medium"
        };
        break;

      case "impression_volume":
        metrics.impression_volume = {
          value: 4000000,
          confidence: "medium"
        };
        break;

      case "creative_count":
        metrics.creative_count = {
          value: 85,
          confidence: "high"
        };
        break;

      case "active_channels":
        metrics.active_channels = ["search", "social", "video"];
        break;

      case "geo_coverage":
        metrics.geo_coverage = ["US"];
        break;
    }
  }

  return {
    domain,
    period,
    metrics,
    evidenceAvailable: true,
    confidence: "medium"
  };
}
