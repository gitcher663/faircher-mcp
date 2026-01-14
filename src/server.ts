import express from "express";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 8080;

/**
 * Root health endpoint (MUST NOT 404)
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    service: "faircher-mcp",
    status: "ok",
  });
});

/**
 * MCP discovery endpoint
 */
app.get("/.well-known/mcp.json", (_req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "faircher-mcp",
      version: "1.0.0",
    },
    transports: [
      {
        type: "http",
        endpoint: "/mcp",
      },
    ],
  });
});

/**
 * MCP JSON-RPC endpoint
 */
app.post("/mcp", (req, res) => {
  const { id, method } = req.body ?? {};

  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: {
          name: "faircher-mcp",
          version: "1.0.0",
        },
        capabilities: {
          tools: {},
        },
      },
    });
  }

  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [],
      },
    });
  }

  return res.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`,
    },
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Faircher MCP server listening on ${PORT}`);
});
