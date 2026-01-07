import { createServer } from "http";
import { tools } from "./tools"; // or wherever you register them

type MCPRequest = {
  method: string;
  params?: any;
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
      tools
    };
  }

  if (method === "tools/call") {
    const tool = tools.find(t => t.name === params.name);
    if (!tool) {
      throw new Error("Tool not found");
    }

    return await tool.run(params.arguments);
  }

  throw new Error(`Unknown method: ${method}`);
}

createServer(async (req, res) => {
  let body = "";

  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const json = JSON.parse(body);
      const result = await handleRequest(json);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err: any) {
      res.writeHead(500);
      res.end(err.message);
    }
  });
}).listen(3000);
