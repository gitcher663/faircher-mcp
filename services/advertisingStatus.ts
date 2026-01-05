import { SupabaseAdapter } from "../adapters/supabase";

export type AdvertisingStatusInput = { entityId: string };
export type AdActivityInput = {
  entityId: string;
  metrics?: string[];
  period?: "recent" | "last_30_days" | "last_90_days";
};

const supabase = new SupabaseAdapter();

export async function resolveAdvertisingStatus(
  input: AdvertisingStatusInput
): Promise<ReturnType<SupabaseAdapter["getAdvertisingStatus"]>> {
  return supabase.getAdvertisingStatus(input.entityId);
}

export async function getAdActivity(
  input: AdActivityInput
): Promise<ReturnType<SupabaseAdapter["getAdActivity"]>> {
  return supabase.getAdActivity(input.entityId, input.metrics, input.period);
}
