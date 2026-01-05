import { entityLookupTool } from "./entity_lookup";
import { confirmEntityTool } from "./confirm_entity";
import { resolveAdvertisingStatusTool } from "./resolve_advertising_status";
import { getAdActivityTool } from "./get_ad_activity";

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export const tools: McpTool[] = [
  entityLookupTool,
  confirmEntityTool,
  resolveAdvertisingStatusTool,
  getAdActivityTool
];

export default tools;
