import express, { Request, Response } from "express";
// Tools live at the repository root (../tools) rather than under src.
import rawTools from "../tools";

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

/**
 * UPDATED SYSTEM PROMPT
 * - Removes confirmation gating
 * - Encourages direct domain-based lookup
 * - Preserves factual/tool-only guarantees
 */
const SYSTEM_PROMPT = `Direct workflow: Input → Analyze → Respond.
- Users may provide a company domain directly.
- You may immediately invoke advertising and activity tools using the provided domain.
- No entity confirmation or persistence step is required.
- Do not fabricate advertising data; rely exclusively on tool outputs.
- If data is unavailable, state so clearly without inference.`;

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
          version: "2.1.0"
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
    const a
