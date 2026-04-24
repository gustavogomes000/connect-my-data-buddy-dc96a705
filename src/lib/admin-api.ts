import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  (typeof process !== "undefined"
    ? process.env?.MY_SUPABASE_URL || process.env?.SUPABASE_URL
    : undefined) || import.meta.env.VITE_MY_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  (typeof process !== "undefined"
    ? process.env?.MY_SUPABASE_SERVICE_ROLE_KEY ||
      process.env?.SUPABASE_SERVICE_ROLE_KEY ||
      process.env?.MY_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.SUPABASE_PUBLISHABLE_KEY
    : undefined) ||
  import.meta.env.VITE_MY_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cliente único reutilizado entre invocações
const adminClient: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

function requireAdmin() {
  const cookie = getCookie("admin_session");
  const header = getRequestHeader("x-admin-token");
  if (cookie !== "authenticated" && header !== "authenticated") {
    throw new Error("Não autorizado");
  }
}

function getAdminSupabase(): SupabaseClient {
  if (!adminClient) throw new Error("Configuração do servidor incompleta");
  return adminClient;
}

// Todas as funções admin agora vêm do arquivo functions (que usa o guard de token correto)
export {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getProgramacaoAdmin,
  createProgramacao,
  updateProgramacao,
  deleteProgramacao,
  getPodcastsAdmin,
  createPodcast,
  updatePodcast,
  deletePodcast,
  createAdminUser,
  getPromotionEntries,
  deletePromotionEntry,
  getUploadUrl,
} from "./admin-api.functions";

// ── Auto News ──
export { triggerAutoNewsManual } from "./admin-api.functions";

// ── Site Settings ──

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw new Error(error.message);
  
  const settings: Record<string, any> = {};
  data?.forEach(row => {
    try {
      settings[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      settings[row.setting_key] = row.setting_value;
    }
  });
  return settings;
});

export const updateSiteSettings = createServerFn({ method: "POST" })
  .inputValidator((input: { key: string; value: any }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    
    let stringValue = typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value);
    
    // UPSERT behavior
    const { error } = await supabase.from("site_settings").upsert({
      setting_key: data.key,
      setting_value: stringValue,
      updated_at: new Date().toISOString()
    }, { onConflict: 'setting_key' });
    
    if (error) throw new Error(error.message);
    return { success: true };
  });
