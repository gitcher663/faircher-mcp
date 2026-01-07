import { getAdActivityTool } from "./get_ad_activity";

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

export const tools: McpTool[] = [getAdActivityTool];

export default tools;
