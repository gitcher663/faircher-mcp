import { getAdActivityTool } from "./get_ad_activity";

export type McpToolResult = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<McpToolResult>;
};

export const tools: McpTool[] = [getAdActivityTool];

export default tools;
