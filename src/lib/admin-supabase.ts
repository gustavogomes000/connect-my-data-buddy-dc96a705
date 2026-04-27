import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import type { Database } from "@/integrations/supabase/types";
import { resolveRuntimeEnv } from "@/lib/runtime-env";

let adminClient: SupabaseClient<Database> | null = null;

export async function getAdminSupabase() {
  if (adminClient) return adminClient;
  const meta: any = (import.meta as any)?.env || {};

  const url =
    meta.VITE_MY_SUPABASE_URL ||
    meta.VITE_SUPABASE_URL ||
    meta.MY_SUPABASE_URL ||
    meta.SUPABASE_URL ||
    (await resolveRuntimeEnv("MY_SUPABASE_URL", "SUPABASE_URL"));
  const key =
    meta.VITE_MY_SUPABASE_SERVICE_ROLE_KEY ||
    meta.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    meta.MY_SUPABASE_SERVICE_ROLE_KEY ||
    meta.SUPABASE_SERVICE_ROLE_KEY ||
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
