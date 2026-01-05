import { getAdActivity } from "../services/advertisingStatus";
import { McpTool } from "./index";

const schema = require("../schemas/tools/get_ad_activity.schema.json");

export const getAdActivityTool: McpTool = {
  name: "faircher.get_ad_activity",
  description:
    "Retrieve structured advertising activity metrics for a confirmed Faircher entity, including presence indicators and quantitative estimates across supported media channels. This tool will fail if the entity has not been explicitly confirmed.",
  inputSchema: schema as Record<string, unknown>,

  async run(args) {
    const entityId = String(args.entityId ?? "").trim();
    const metrics = Array.isArray(args.metrics)
      ? (args.metrics as string[])
      : undefined;
    const period =
      (args.period as "recent" | "last_30_days" | "last_90_days" | undefined) ?? "recent";

    if (!entityId) {
      throw new Error("Missing required input parameter: entityId");
    }

    const data = await getAdActivity({ entityId, metrics, period });

    // MCP-compliant response
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
