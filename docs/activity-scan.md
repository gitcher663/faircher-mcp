# Ad Activity Scan Tool (`ad_intelligence`)

## Purpose

The Ad Activity Scan tool (`ad_intelligence`) determines whether a business, brand, or domain is actively advertising and identifies the channels where advertising activity is detected.

This tool is designed for:
- Ad sales qualification and prospecting
- Agency lead research
- Competitive intelligence
- Market and brand analysis

It answers high-level questions like:
> “Is this company advertising right now?”

---

## Supported Question Patterns (Positive Triggers)

- “Is X advertising?”
- “Is X running ads?”
- “Where is X advertising?”
- “Which platforms is X buying ads on?”

---

## Negative Triggers (When NOT to Call This Tool)

- “How much does X spend on ads?”
- “Show me X’s ads”
- “What do X’s ads look like?”
- “Create ads like X”

---

## Output Contract

```json
{
  "is_advertising": true,
  "channels_detected": ["search", "social"],
  "confidence": "high",
  "evidence_summary": "Active paid search ads detected along with recent social advertising activity."
}
```
