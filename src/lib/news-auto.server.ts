import { getSupabaseAdmin } from "@/integrations/supabase/client.server";
import { isAutoNewsEnabled, runNewsIngestWithClient, type NewsIngestResult } from "./news-auto.shared";

export async function runAutoNewsIngest(): Promise<NewsIngestResult> {
  const adminClient = await getSupabaseAdmin();
  const enabled = await isAutoNewsEnabled(adminClient);
  if (!enabled) return { inserted: 0, skipped: 0, total: 0 };
  return runNewsIngestWithClient(adminClient);
}

export async function runManualNewsIngest(): Promise<NewsIngestResult> {
  const adminClient = await getSupabaseAdmin();
  return runNewsIngestWithClient(adminClient);
}
