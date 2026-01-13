import { McpTool } from "./index";
import { serpGoogleSearch } from "../services/serpapi";

/**
 * MCP Tool: Google Search via SerpAPI
 */
export const googleSearchTool: McpTool = {
  name: "web.google_search",
  description: "Run a Google search query and return organic search results.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      query: {
        type: "string",
        description: "Search query to run on Google",
      },
      num_results: {
        type: "number",
        description: "Maximum number of organic results to return",
        default: 10,
      },
    },
    required: ["query"],
  },

  async run(args) {
    const query =
      typeof args.query === "string" ? args.query.trim() : "";

    if (!query) {
      throw new Error("Missing required parameter: query");
    }

    const numResults =
      typeof args.num_results === "number" && args.num_results > 0
        ? args.num_results
        : 10;

    const results = await serpGoogleSearch({
      query,
      numResults,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
};

export default googleSearchTool;
