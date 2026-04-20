import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env?.SUPABASE_URL : undefined);
const SUPABASE_KEY =
  (typeof process !== "undefined" ? process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined) ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== "undefined" ? process.env?.SUPABASE_PUBLISHABLE_KEY : undefined);

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

// ── Promotions ──

export const getPromotions = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const supabase = getAdminSupabase();
  const { data } = await supabase.from("promotions").select("*").order("display_order");
  return data || [];
});

export const createPromotion = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; description?: string; image_url?: string; link?: string; popup_duration_seconds?: number; show_as_popup?: boolean; display_order?: number }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("promotions").insert({ ...data, is_active: true }).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updatePromotion = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; title?: string; description?: string; image_url?: string; link?: string; is_active?: boolean; popup_duration_seconds?: number; show_as_popup?: boolean; display_order?: number }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await supabase.from("promotions").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deletePromotion = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("promotions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── News ──

export const getNews = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const supabase = getAdminSupabase();
  const { data } = await supabase.from("news").select("*").order("display_order");
  return data || [];
});

export const createNews = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; content?: string; summary?: string; image_url?: string; podcast_link?: string; display_order?: number }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("news").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateNews = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; title?: string; content?: string; summary?: string; image_url?: string; podcast_link?: string; is_published?: boolean; display_order?: number }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await supabase.from("news").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteNews = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Programação ──

export const getProgramacaoAdmin = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const supabase = getAdminSupabase();
  const { data } = await (supabase as any)
    .from("programacao")
    .select("*")
    .order("day_of_week")
    .order("start_time");
  return data || [];
});

export const createProgramacao = createServerFn({ method: "POST" })
  .inputValidator((input: { day_of_week: number; program_name: string; presenter?: string; start_time: string; end_time: string; display_order?: number }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await (supabase as any).from("programacao").insert({ ...data, is_active: true }).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateProgramacao = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; day_of_week?: number; program_name?: string; presenter?: string; start_time?: string; end_time?: string; display_order?: number; is_active?: boolean }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any).from("programacao").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteProgramacao = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await (supabase as any).from("programacao").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Podcasts ──

export const getPodcastsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const supabase = getAdminSupabase();
  const { data } = await (supabase as any)
    .from("podcasts")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });
  return data || [];
});

export const createPodcast = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; description?: string; youtube_url: string; thumbnail_url?: string; display_order?: number }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await (supabase as any).from("podcasts").insert({ ...data, is_active: true }).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updatePodcast = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; title?: string; description?: string; youtube_url?: string; thumbnail_url?: string; display_order?: number; is_active?: boolean }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any).from("podcasts").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deletePodcast = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await (supabase as any).from("podcasts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Admin User Management ──

export const createAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.rpc("admin_create_user", {
      p_username: data.username,
      p_password: data.password,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Promotion Entries ──

export const getPromotionEntries = createServerFn({ method: "POST" })
  .inputValidator((input: { promotion_id?: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    let q = (supabase as any).from("promotion_entries").select("*, promotions(title)").order("created_at", { ascending: false });
    if (data.promotion_id) q = q.eq("promotion_id", data.promotion_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows || [];
  });

export const deletePromotionEntry = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const { error } = await (supabase as any).from("promotion_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Upload media ──

export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { filename: string; contentType: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin();
    const supabase = getAdminSupabase();
    const path = `uploads/${Date.now()}-${data.filename}`;
    const { data: result, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    return { signedUrl: result.signedUrl, token: result.token, path, publicUrl };
  });

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
