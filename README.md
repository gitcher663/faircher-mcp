# FairCher MCP Server

FairCher is an ad intelligence tool that provides visibility into advertising
activity across search, display, social, streaming, and broadcast channels.

This MCP server exposes FairCher capabilities to the ChatGPT UI.

## Tools
- `ad_intelligence` – analyze advertising activity for a brand or domain
- `google_ads.activity_lookup` – Google Ads activity presence lookup
- `meta_ads_lookup` – Meta Ads presence lookup (placeholder)
- `tiktok_ads_lookup` – TikTok Ads presence lookup (placeholder)
- `linkedin_ads_lookup` – LinkedIn Ads presence lookup (placeholder)

## Input
- Brand name or domain (required)
- Optional list of advertising channels

## Architecture
FairCher uses third-party data providers internally.
Providers are implementation details and may vary by channel.

## Environment Variables
- `SEARCHAPI_API_KEY` (required)

## Deployment
Deploy on Railway or any Node.js-compatible platform.
Expose the `/mcp` endpoint publicly.
