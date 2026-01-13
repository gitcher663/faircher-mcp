// src/server.ts
import express from "express";
import tools, { McpTool } from "../tools"; // tools/index.ts exports `tools` array (default) and McpTool type

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// build capabilities/tools map used by both SSE and JSON-RPC initialize
function buildToolDescriptor(t: McpTool) {
  return {
    title: t.description ?? t.name,
    description: t.description ?? "",
    inputSchema: t.inputSchema ?? {},
    // If you add widget metadata for a tool (openai/outputTemplate etc.) attach it as `_meta` on the tool
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
  // For JSON-RPC initialize we provide the same tools mapping under capabilities.tools
  tools: Object.keys(capabilitiesTools).map((name) => ({
    name,
    ...((capabilitiesTools as any)[name] as object),
  })),
};

// Basic middleware
app.use(express.json());

// Health and manifest endpoints
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// /.well-known/mcp.json: provides server manifest
app.get("/.well-known/mcp.json", (_req, res) => {
  res.json({
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    protocolVersion: manifest.protocolVersion,
    transport: manifest.transport,
    // Expose capabilities in the shape ChatGPT expects for some flows
    capabilities: { tools: capabilitiesTools },
  });
});

/**
 * SSE endpoint expected by Developer Mode / Admin UI
 *
 * - The stream MUST begin with event: ready (and no other stray text before it)
 * - Immediately advertise capabilities (tools). Developer Mode expects capabilities after ready.
 * - Keep the stream open and only send well-formed SSE frames.
 */
app.get("/sse", (req, res) => {
  // Required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // allow cross-origin dev usage; tighten in production if necessary
  res.setHeader("Access-Control-Allow-Origin", "*");

  // flush headers (helpful on some runtimes)
  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  // 1) ready — this must be the first event
  res.write(`event: ready\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

  // 2) capabilities — advertise tools (object form)
  const capabilitiesPayload = { tools: capabilitiesTools };
  res.write(`event: capabilities\ndata: ${JSON.stringify(capabilitiesPayload)}\n\n`);

  // 3) heartbeat (only after capabilities)
  const interval = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(interval);
  });
});

/**
 * Minimal JSON-RPC v2 /mcp endpoint
 *
 * Supports:
 *  - initialize -> returns protocolVersion, serverI*
