// src/tools/index.ts

import { advertisingActivityTool } from "./advertisingActivity";

/**
 * Export all MCP tools from this module.
 * The server will register these during initialization.
 */
export const tools = [
  advertisingActivityTool,
];
