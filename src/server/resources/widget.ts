import { readFileSync } from "node:fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerWidget(server: McpServer) {
  const JS = readFileSync("web/dist/app.js", "utf8");
  const CSS = readFileSync("web/dist/app.css", "utf8");

  server.registerResource(
    "faircher-widget",
    "ui://widget/faircher.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/faircher.html",
          mimeType: "text/html+skybridge",
          text: `
<div id="root"></div>
<style>${CSS}</style>
<script type="module">${JS}</script>
          `.trim(),
          _meta: {
            "openai/widgetPrefersBorder": true,
            "openai/widgetCSP": {
              connect_domains: ["https://serpapi.com"],
              resource_domains: ["https://*.oaistatic.com"],
            },
          },
        },
      ],
    })
  );
}
