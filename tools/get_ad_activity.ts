import { getAdActivity } from "../services/adActivity";
import { McpTool } from "./index";

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
        "Optional list of advertising metric keys to retrieve. If omitted, a default core metric set is returned.",
      items: {
        type: "string"
      }
    },
    period: {
      type: "string",
      enum: ["recent", "last_30_days", "last_90_days"],
      description:
        "Time period over which advertising activity should be evaluated."
    }
  },
  required: ["domain"]
};

export const getAdActivityTool: McpTool = {
  name: "faircher.get_ad_activity",
  description:
    "Retrieve structured advertising activity metrics for a business based on its domain, including presence indicators and quantitative estimates across supported media channels.",
  inputSchema: schema,

  async run(args) {
    const domain = String(args.domain ?? "").trim();

    const metrics = Array.isArray(args.metrics)
      ? (args.metrics as string[])
      : undefined;

    const period =
      (args.period as "recent" | "last_30_days" | "last_90_days" | undefined) ??
      undefined;

    if (!domain) {
      throw new Error("Missing required input parameter: domain");
    }

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
