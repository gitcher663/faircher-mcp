import { getAdActivityTool } from "./get_ad_activity";
import { resolveAdvertisingStatusTool } from "./resolve_advertising_status";

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export const tools: McpTool[] = [
  getAdActivityTool,
  resolveAdvertisingStatusTool
];

export default tools;
