import express from "express";

const app = express();
const port = process.env.PORT || 8080;

const manifest = {
  name: "FairCher MCP",
  description: "MCP server for the FairCher ChatGPT app",
  version: "1.0.0",
  protocolVersion: "2024-11-05",
  transport: {
    type: "sse",
    endpoint: "/sse",
  },
  tools: [],
};

app.get("/.well-known/mcp.json", (_req, res) => {
  res.json(manifest);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`event: ready\ndata: {"status":"connected"}\n\n`);

  const interval = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  req.on("close", () => clearInterval(interval));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`FairCher MCP listening on ${port}`);
});
