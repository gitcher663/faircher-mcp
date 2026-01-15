# FairCher MCP Server

FairCher is an ad intelligence tool that provides visibility into advertising
activity across search, display, social, streaming, and broadcast channels.

This MCP server exposes FairCher capabilities to the ChatGPT UI.

## Tool
- `ad_intelligence` – analyze advertising activity for a brand or domain

## Input
- Brand name or domain (required)
- Optional list of advertising channels

## Architecture
FairCher uses third-party data providers internally.
Providers are implementation details and may vary by channel.

## Environment Variables
- `SERPAPI_API_KEY` (required)

## Deployment
Deploy on Railway or any Node.js-compatible platform.
Expose the `/mcp` endpoint publicly.
