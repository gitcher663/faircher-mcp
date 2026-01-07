// MCP: tools/call
if (method === "tools/call") {
  const toolName = params?.name as string | undefined;
  const args = (params?.arguments ?? {}) as Record<string, unknown>;

  const tool = tools.find(t => t.name === toolName);

  if (!tool) {
    return res.status(404).json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Tool not found: ${toolName}` }
    });
  }

  try {
    const toolResult = await tool.run(args);

    /**
     * MCP GROUNDING RULE:
     * Tool results MUST be returned inside result.content[]
     * or ChatGPT will hallucinate by default.
     */
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: Array.isArray((toolResult as any)?.content)
          ? (toolResult as any).content
          : [
              {
                type: "json",
                json: toolResult
              }
            ]
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown tool error";

    return res.status(400).json({
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message }
    });
  }
}
