import { getAdActivity } from "../services/adActivity";
import { McpTool } from "./index";

const schema = require("../schemas/tools/get_ad_activity.schema.json");

export const getAdActivityTool: McpTool = {
  name: "faircher.get_ad_activity",
  description:
    "Retrieve structured advertising activity metrics for a business based on its domain, including presence indicators and quantitative estimates across supported media channels.",
  inputSchema: schema as Record<string, unknown>,

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
