export type Confidence = "high" | "medium" | "low";

export function toConfidence(score: number): Confidence {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}
