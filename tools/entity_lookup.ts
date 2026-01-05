import { resolveEntity } from "../services/entityResolver";
import { McpTool } from "./index";

const schema = require("../schemas/tools/entity_lookup.schema.json");

export const entityLookupTool: McpTool = {
  name: "faircher.entity_lookup",
  description:
    "Resolve a business name, brand, domain, URL, or CRM account label into a canonical Faircher entity. This tool must be used before invoking any other Faircher tool.",
  inputSchema: schema as Record<string, unknown>,
  async run(args) {
    const input = String(args.input ?? "").trim();
    const source = (args.source as string | undefined) ?? "unknown";

    if (!input) {
      throw new Error("Missing required input parameter: input");
    }

    const resolution = await resolveEntity({ input, source });
    return resolution;
  }
};

export default entityLookupTool;
