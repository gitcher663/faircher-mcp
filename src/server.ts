import { createServer } from "http";
import { tools } from "../tools";

/**
 * BUILD VERIFICATION LOG
 * If you do not see this in Railway logs,
 * the deployed code is NOT this file.
 */
console.log("SERVER CODE VERSION:", "SSE_MCP_SERVER_V3");

const PORT = Number(process.env.PORT || 8080);

createServer((req, res) => {
  const { method, url } = req;

  // ===============================
  // 0. HEALTH CHECK (INFRA ONLY)
  // ===============================
  if (method === "GET" && url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // ===============================
  // 1. SSE STREAM (SERVER → CLIENT)
  // ===============================
  if (method === "GET" && url === "/sse") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    // ---- MCP INITIALIZE EVENT ----
    res.write(
      `event: message\n` +
        `data: ${JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {
                list: true,
                call: true,
              },
            },
          },
        })}\n\n`
    );

    // ---- KEEP-ALIVE PING (CRITICAL) ----
    const ping = setInterval(() => {
      res.write(`event: ping\ndata: {}\n\n`);
    }, 15000);

    req.on("close", () => {
      clearInterval(ping);
      console.log("SSE connection closed");
    });

    return;
  }

  // =================================
  // 2. MCP REQUESTS (CLIENT → SERVER)
  // =================================
  if (method === "POST" && url === "/sse") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      console.log("MCP POST RECEIVED:", body);

      /**
       * ACK is required so MCP clients do not error.
       * Tool dispatch will be wired later.
       */
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("{}");
    });

    return;
  }

  // ===============================
  // 3. MCP JSON-RPC GUARD (OPTIONAL)
  // ===============================
  if (url === "/mcp") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "This MCP server uses SSE transport at /sse",
      })
    );
    return;
  }

  // ===============================
  // 4. EVERYTHING ELSE → 404
  // ===============================
  res.writeHead(404);
  res.end();
}).listen(PORT, "0.0.0.0", () => {
  console.log(`MCP SSE server listening on port ${PORT}`);
});
