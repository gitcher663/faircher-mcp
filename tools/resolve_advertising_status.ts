import { resolveAdvertisingStatus } from "../services/advertisingStatus";
import { McpTool } from "./index";

const schema = require("../schemas/tools/resolve_advertising_status.schema.json");

export const resolveAdvertisingStatusTool: McpTool = {
  name: "faircher.resolve_advertising_status",
  description:
    "Determine whether a resolved Faircher entity shows evidence of recent or current advertising activity. Confirmation is required before this tool can be invoked.",
  inputSchema: schema as Record<string, unknown>,
  async run(args) {
    const entityId = String(args.entityId ?? "").trim();

    if (!entityId) {
      throw new Error("Missing required input parameter: entityId");
    }

    return resolveAdvertisingStatus({ entityId });
  }
};

export default resolveAdvertisingStatusTool;
