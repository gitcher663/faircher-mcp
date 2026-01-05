import express, { Request, Response } from "express";
import rawTools from "./tools"; // FIXED PATH

const app = express();
app.use(express.json());

const PORT: number = Number(process.env.PORT) || 8000;

/**
 * Explicit tool definition to satisfy strict TypeScript
 */
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: unknown;
  run: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Cast imported tools to a known, safe shape
 */
const tools = rawTools as ToolDefinition[];

const SYSTEM_PROMPT = `Strict workflow: Resolve → Confirm → Ask → Analyze.
- Always call faircher.entity_lookup first to resolve user input via Supabase and persist an unconfirmed entity.
- Present the returned canonical entity summary and request explicit user confirmation before any advertising tools.
- Call faircher.confirm_entity with confirmed=true before invoking advertising or status tools.
- Do not infer or fabricate advertising data; use only tool outputs.
- Block advertising activity retrieval if the entity is not confirmed in Supabase.`;

app.post("/mcp", async (req: Request, res: Response) => {
  const { id, method, params } = req.body ?? {};

  if (!method || typeof method !== "string") {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code: -32600, message: "Invalid Request" }
    });
  }

  /**
   * MCP: initialize
   */
  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "faircher-mcp",
          version: "2.0.0"
        },
        capabilities: {
          tools: {}
        },
        instructions: SYSTEM_PROMPT
      }
    });
  }

  /**
   * MCP: tools/list
   */
  if (method === "tools/list") {
    const listedTools = tools.map((tool: ToolDefinition) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));

    return res.json({
      jsonrpc: "2.0",
      id,
      result: { tools: listedTools }
    });
  }

  /**
   * MCP: tools/call
   */
  if (method === "tools/call") {
    const toolName = params?.name as string | undefined;
    const args = (params?.arguments ?? {}) as Record<string, unknown>;

    const tool = tools.find(
      (item: ToolDefinition) => item.name === toolName
    );

    if (!tool) {
      return res.status(404).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` }
      });
    }

    try {
      const result = await tool.run(args);

      return res.json({
        jsonrpc: "2.0",
        id,
        result
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown tool error";

      return res.status(400).json({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message }
      });
    }
  }

  return res.status(404).json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  });
});

/**
 * Health check
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faircher MCP server listening on port ${PORT}`);
});
