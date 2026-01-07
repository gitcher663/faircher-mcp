import { getAdActivity } from "../services/adActivity";
import { McpTool } from "./index";

const schema = require("../schemas/tools/resolve_advertising_status.schema.json");

export const resolveAdvertisingStatusTool: McpTool = {
  name: "faircher.resolve_advertising_status",
  description:
    "Determine whether a business shows evidence of recent advertising activity based on its domain.",
  inputSchema: schema as Record<string, unknown>,

  async run(args) {
    const domain = String(args.domain ?? "").trim();

    if (!domain) {
      throw new Error("Missing required input parameter: domain");
    }

    const activity = await getAdActivity({ domain });

    const hasActivity =
      activity.evidenceAvailable &&
      Object.keys(activity.metrics).length > 0;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              domain,
              advertisingStatus: hasActivity
                ? "advertising_detected"
                : "no_recent_signals",
              confidence: activity.confidence
            },
            null,
            2
          )
        }
      ]
    };
  }
};

export default resolveAdvertisingStatusTool;
