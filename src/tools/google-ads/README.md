# Google Ads Activity Tool

This tool checks **advertising activity on Google Ads only**.

## Why this is called an “activity” tool

The term **activity** refers to **presence detection**, not aggregation.

This tool answers one narrow question:

> “Is there evidence that this entity is currently advertising on Google Ads?”

It does **not**:
- Aggregate across channels
- Represent overall advertising activity
- Inspect or analyze ad creatives
- Estimate spend or performance

## Scope clarification

- **Channel:** Google Ads
- **Signal type:** Activity / presence (yes or no)
- **Data source:** Google Ads Transparency Center (Advertiser Search via SearchAPI)

Any overall “is this company advertising?” conclusion is produced by
higher-level orchestration (e.g. activity scan), **not by this tool**.

## Important architectural rule

- Tools = channel-specific sensors  
- “Advertising activity” = an emergent conclusion  
- Conclusions do **not** get their own tools

This is why there is **no global advertising activity tool**.
