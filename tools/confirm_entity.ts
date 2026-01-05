import { SupabaseAdapter } from "../adapters/supabase";
import { McpTool } from "./index";

const schema = require("../schemas/tools/confirm_entity.schema.json");

const supabase = new SupabaseAdapter();

export const confirmEntityTool: McpTool = {
  name: "faircher.confirm_entity",
  description:
    "Explicitly confirm a resolved Faircher entity so that advertising tools can be executed.",
  inputSchema: schema as Record<string, unknown>,
  async run(args) {
    const entityId = String(args.entityId ?? "").trim();
    const confirmed = Boolean(args.confirmed);

    if (!entityId) {
      throw new Error("Missing required input parameter: entityId");
    }

    if (!confirmed) {
      throw new Error("Explicit confirmation is required to unlock advertising tools.");
    }

    const entity = await supabase.confirmEntity(entityId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              entityId: entity.entity_id,
              canonicalName: entity.canonical_name,
              primaryDomain: entity.primary_domain,
              confirmed: entity.confirmed,
              confirmationApplied: true
            },
            null,
            2
          )
        }
      ]
    };
  }
};

export default confirmEntityTool;
