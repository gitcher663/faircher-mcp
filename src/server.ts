import fetch from "node-fetch";

const SERP_API_KEY = process.env.SERPAPI_KEY;

export async function serpGoogleSearch({
  query,
  numResults,
}: {
  query: string;
  numResults: number;
}) {
  if (!SERP_API_KEY) {
    throw new Error("SERPAPI_KEY is not set");
  }

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    num: String(numResults),
    api_key: SERP_API_KEY,
  });

  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) {
    throw new Error(`SerpAPI error: ${res.statusText}`);
  }

  const json = await res.json();

  return {
    query,
    organic_results: json.organic_results ?? [],
  };
}
