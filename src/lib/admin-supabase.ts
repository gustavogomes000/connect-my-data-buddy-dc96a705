import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import type { Database } from "@/integrations/supabase/types";
import { resolveRuntimeEnv } from "@/lib/runtime-env";

let adminClient: SupabaseClient<Database> | null = null;

export async function getAdminSupabase() {
  if (adminClient) return adminClient;

  const url =
    import.meta.env.VITE_MY_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    (await resolveRuntimeEnv("MY_SUPABASE_URL", "SUPABASE_URL"));
  const key =
    import.meta.env.VITE_MY_SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    (await resolveRuntimeEnv("MY_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"));

  if (!url || !key) {
    throw new Error(
      `Configuração do servidor incompleta: SUPABASE_URL=${url ? "ok" : "MISSING"} KEY=${key ? "ok" : "MISSING"}`,
    );
  }

  adminClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export async function verifyAdminPassword(password: string, storedHash: string) {
  if (!storedHash) return false;

  if (storedHash === password) return true;

  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    return false;
  }
}

export async function hashAdminPassword(password: string) {
  return bcrypt.hash(password, 10);
}
