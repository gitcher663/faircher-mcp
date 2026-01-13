import { createServer } from "http";
import { tools } from "../tools";

/**
 * BUILD VERIFICATION LOG
 * If you do not see this in Railway logs,
 * the deployed code is NOT this file.
 */
console.log("SERVER CODE VERSION:", "SSE_MCP_SERVER_V2");

const PORT = Number(process.env.PORT || 8080);

createServer((req, res) => {
  // ===============================
  // 1. SSE STREAM (SERVER → CLIENT)
  // ===============================
  if (req.method === "GET" && req.url === "/sse") {
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
  if (req.method === "POST" && req.url === "/sse") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      console.log("MCP POST RECEIVED:", body);

      /**
       * For now, we just ACK the request.
       * This is REQUIRED so ChatGPT does not error.
       * Tool handling will be wired in the next step.
       */
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("{}");
    });

    return;
  }

  // ===============================
  // 3. EVERYTHING ELSE → 404
  // ===============================
  res.writeHead(404);
  res.end();
}).listen(PORT, "0.0.0.0", () => {
  console.log(`MCP SSE server listening on port ${PORT}`);
});
