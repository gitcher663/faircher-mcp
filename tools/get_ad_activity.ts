import { getAdActivity } from "../services/adActivity";
import { McpTool } from "./index";

/**
 * Inline JSON Schema
 * Domain-first, evidence-only.
 */
const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    domain: {
      type: "string",
      description: "Company domain to analyze advertising activity for",
    },
    period: {
      type: "string",
      enum: ["recent", "last_30_days", "last_90_days"],
      description:
        "Time period over which advertising activity should be evaluated",
    },
  },
  required: ["domain"],
} as const;

export const getAdActivityTool: McpTool = {
  name: "faircher.get_ad_activity",
  description:
    "Retrieve evidence-backed advertising activity observed for a business domain.",
  inputSchema: schema,

  async run(args) {
    const domain =
      typeof args.domain === "string" ? args.domain.trim().toLowerCase() : "";

    if (!domain) {
      throw new Error("Missing required parameter: domain");
    }

    const period =
      args.period === "recent" ||
      args.period === "last_30_days" ||
      args.period === "last_90_days"
        ? args.period
        : undefined;

    const data = await getAdActivity({
      domain,
      period,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  },
};

export default getAdActivityTool;
