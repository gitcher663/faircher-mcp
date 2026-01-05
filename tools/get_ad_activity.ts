import { getAdActivity } from "../services/advertisingStatus";
import { McpTool } from "./index";

const schema = require("../schemas/tools/get_ad_activity.schema.json");

export const getAdActivityTool: McpTool = {
  name: "faircher.get_ad_activity",
  description:
    "Retrieve structured advertising activity metrics for a resolved Faircher entity, including presence indicators and quantitative estimates across supported media channels.",
  inputSchema: schema as Record<string, unknown>,
  async run(args) {
    const entityId = String(args.entityId ?? "").trim();
    const metrics = Array.isArray(args.metrics)
      ? (args.metrics as string[])
      : undefined;
    const period = (args.period as string | undefined) ?? "recent";

    if (!entityId) {
      throw new Error("Missing required input parameter: entityId");
    }

    return getAdActivity({ entityId, metrics, period });
  }
};

export default getAdActivityTool;
