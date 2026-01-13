// src/server.ts
import express, { Request, Response } from "express";
import tools, { McpTool } from "../tools";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Build a descriptor for each tool to advertise in capabilities
function buildToolDescriptor(t: McpTool) {
  return {
    title: t.description ?? t.name,
    description: t.description ?? "",
    inputSchema: t.inputSchema ?? {},
    _meta: (t as any)._meta ?? {},
  };
}

const capabilitiesTools: Record<string, unknown> = {};
for (const t of tools) {
  capabilitiesTools[t.name] = buildToolDescriptor(t);
}

const manifest = {
  name: "FairCher MCP",
  description: "MCP server for the FairCher ChatGPT app",
  version: "1.0.0",
  protocolVersion: "2024-11-05",
  transport: {
    type: "sse",
    endpoint: "/sse",
  },
  tools: Object.keys(capabilitiesTools).map((name) => ({
    name,
    ...((capabilitiesTools as any)[name] as object),
  })),
};

// Middleware
app.use(express.json());

// Health and manifest endpoints
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/.well-known/mcp.json", (_req, res) => {
  res.json({
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    protocolVersion: manifest.protocolVersion,
    transport: manifest.transport,
    capabilities: { tools: capabilitiesTools },
  });
});

/**
 * SSE handler that accepts GET and POST.
 *
 * Important rules:
 *  - DO NOT write any bytes to the response before `event: ready`.
 *  - Immediately after `ready` send `capabilities`.
 *  - Keep connection open (do not end response).
 */
function sseHandler(req: Request, res: Response) {
  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // CORS / preflight allowances (adjust for production)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // flush headers when supported
  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  // 1) ready — this MUST be the first event (no stray bytes before this)
  res.write(`event: ready\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

  // 2) capabilities — advertise tools (object form)
  const capabilitiesPayload = { tools: capabilitiesTools };
  res.write(`event: capabilities\ndata: ${JSON.stringify(capabilitiesPayload)}\n\n`);

  // 3) heartbeat ping only after capabilities
  const interval = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  // cleanup when client disconnects
  req.on("close", () => {
    clearInterval(interval);
  });
}

// Register SSE routes for GET, POST and support OPTIONS preflight
app.get("/sse", sseHandler);
app.post("/sse", sseHandler);
app.options("/sse", (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

/**
 * Minimal JSON-RPC v2 /mcp endpoint
 *
 * Supports:
 *  - initialize -> returns protocolVersion, serverInfo, capabilities
 *  - tools/list  -> returns tools (object form)
 *  - tools/call  -> calls a tool by name with args { name, args }
 */
app.post("/mcp", async (req, res) => {
  const { jsonrpc, method, params, id } = req.body ?? {};

  function rpcResult(result: unknown) {
    return res.json({ jsonrpc: "2.0", id: id ?? null, result });
  }

  function rpcError(code: number, message: string, data?: unknown) {
    return res.json({
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code, message, data },
    });
  }

  try {
    if (method === "initialize") {
      return rpcResult({
        protocolVersion: manifest.protocolVersion,
        serverInfo: { name: manifest.name, version: manifest.version },
        capabilities: { tools: capabilitiesTools },
      });
    }

    if (method === "tools/list") {
      return rpcResult({ tools: capabilitiesTools });
    }

    if (method === "tools/call") {
      const { name, args } = params ?? {};
      if (!name || typeof name !== "string") {
        return rpcError(-32602, "Invalid params: missing tool name");
      }

      const tool = tools.find((t) => t.name === name);
      if (!tool) {
        return rpcError(-32601, `Tool not found: ${name}`);
      }

      try {
        const result = await tool.run(args ?? {});
        return rpcResult(result ?? { content: [] });
      } catch (err: any) {
        return rpcError(-32000, "Tool execution error", {
          message: err?.message ?? String(err),
        });
      }
    }

    return rpcError(-32601, `Method not found: ${String(method)}`);
  } catch (err: any) {
    return rpcError(-32603, "Internal error", { message: err?.message ?? String(err) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FairCher MCP listening on ${PORT}`);
});
