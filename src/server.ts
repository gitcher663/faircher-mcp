import { createServer } from "http";
import { tools } from "../tools";

/**
 * BUILD VERIFICATION LOG
 */
console.log("SERVER CODE VERSION:", "SSE_MCP_SERVER");

const PORT = Number(process.env.PORT || 8080);

createServer((req, res) => {
  // MCP REQUIRES: GET /sse
  if (req.method !== "GET" || req.url !== "/sse") {
    res.writeHead(404);
    res.end();
    return;
  }

  // REQUIRED SSE HEADERS
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

  // KEEP CONNECTION ALIVE (CRITICAL)
  const ping = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(ping);
    console.log("SSE connection closed");
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log(`MCP SSE server listening on port ${PORT}`);
});
