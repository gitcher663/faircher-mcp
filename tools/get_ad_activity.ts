import { getAdActivity } from "../services/adActivity";
import { McpTool } from "./index";

/**
 * Inline JSON Schema
 * (prevents runtime MODULE_NOT_FOUND errors in dist/)
 */
const schema: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    domain: {
      type: "string",
      description: "Company domain to analyze advertising activity for"
    },
    metrics: {
      type: "array",
      description:
        "Optional list of advertising metric keys to retrieve. If omitted, a default metric set is returned.",
      items: {
        type: "string"
      }
    },
    period: {
      type: "string",
      enum: ["recent", "last_30_days", "last_90_days"],
      description:
        "Time period over which advertising activity should be evaluated"
    }
  },
  required: ["domain"]
};

export const getAdActivityTool: McpTool = {
  name: "faircher.get_ad_activity",
  description:
    "Retrieve structured advertising activity signals for a business based on its domain.",
  inputSchema: schema,

  async run(args: any) {
    const domain =
      typeof args.domain === "string" ? args.domain.trim() : "";

    if (!domain) {
      throw new Error("Missing required parameter: domain");
    }

    const metrics = Array.isArray(args.metrics)
      ? args.metrics.map(String)
      : undefined;

    const period =
      args.period === "recent" ||
      args.period === "last_30_days" ||
      args.period === "last_90_days"
        ? args.period
        : undefined;

    const data = await getAdActivity({
      domain,
      metrics,
      period
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }
};

export default getAdActivityTool;
