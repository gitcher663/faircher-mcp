import express from "express";
import fs from "fs";
import { adIntelligenceTool } from "./tools/ad_intelligence.js";
import { formatError } from "./utils/errors.js";

const app = express();
app.use(express.json());

const MCP_SPEC = JSON.parse(
  fs.readFileSync("./src/mcp/spec.json", "utf8")
);

app.get("/mcp", (req, res) => {
  res.json(MCP_SPEC);
});

app.post("/mcp/:tool", async (req, res) => {
  try {
    switch (req.params.tool) {
      case "ad_intelligence":
        return res.json(await adIntelligenceTool(req.body));
      default:
        return res.status(404).json({
          error: true,
          message: `Unknown tool: ${req.params.tool}`
        });
    }
  } catch (err) {
    return res.status(500).json(formatError(err));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FairCher MCP server running on port ${PORT}`);
});
