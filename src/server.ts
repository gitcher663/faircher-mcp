import { createServer } from "http";
import { tools } from "../tools";
import type { McpTool } from "../tools";

type MCPRequest = {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

async function handleRequest(req: MCPRequest) {
  const { method, params } = req;

  if (method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      }
    };
  }

  if (method === "tools/list") {
    return {
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    };
  }

  if (method === "tools/call") {
    if (!params?.name) {
      throw new Error("Missing tool name");
    }

    const tool = tools.find(
      (t: McpTo
