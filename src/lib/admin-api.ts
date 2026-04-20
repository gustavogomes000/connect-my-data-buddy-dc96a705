import { createServerFn } from "@tanstack/react-start";

const FALLBACK_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function requireAdmin() {
  const { getCookie } = await import("@tanstack/react-start/server");
  const cookie = getCookie("admin_session");
  if (cookie !== "authenticated") {
    throw new Error("Não autorizado");
  }
}

async function readEnv(key: string): Promise<string | undefined> {
  if (key === "VITE_SUPABASE_URL" && FALLBACK_SUPABASE_URL) return FALLBACK_SUPABASE_URL;
  if (key === "VITE_SUPABASE_PUBLISHABLE_KEY" && FALLBACK_SUPABASE_PUBLISHABLE_KEY) {
    return FALLBACK_SUPABASE_PUBLISHABLE_KEY;
  }
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key];
  try {
    const cf: any = await import(/* @vite-ignore */ "cloudflare:workers");
    const v = cf?.env?.[key];
    if (typeof v === "string" && v) return v;
  } catch {}
  return undefined;
}

async function getAdminSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = (await readEnv("SUPABASE_URL")) || (await readEnv("VITE_SUPABASE_URL"));
  const key =
    (await readEnv("SUPABASE_SERVICE_ROLE_KEY")) ||
    (await readEnv("SUPABASE_PUBLISHABLE_KEY")) ||
    (await readEnv("VITE_SUPABASE_PUBLISHABLE_KEY"));
  if (!url || !key) throw new Error("Configuração do servidor incompleta");
  return createClient(url, key);
}

// ── Promotions ──

export const getPromotions = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  const { data } = await supabase.from("promotions").select("*").order("display_order");
  return data || [];
});

export const createPromotion = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; description?: string; image_url?: string; link?: string; popup_duration_seconds?: number; show_as_popup?: boolean; display_order?: number }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { data: result, error } = await supabase.from("promotions").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updatePromotion = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; title?: string; description?: string; image_url?: string; link?: string; is_active?: boolean; popup_duration_seconds?: number; show_as_popup?: boolean; display_order?: number }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await supabase.from("promotions").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deletePromotion = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { error } = await supabase.from("promotions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── News ──

export const getNews = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const supabase = await getAdminSupabase();
  const { data } = await supabase.from("news").select("*").order("display_order");
  return data || [];
});

export const createNews = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; content?: string; summary?: string; image_url?: string; podcast_link?: string; display_order?: number }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { data: result, error } = await supabase.from("news").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateNews = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; title?: string; content?: string; summary?: string; image_url?: string; podcast_link?: string; is_published?: boolean; display_order?: number }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await supabase.from("news").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteNews = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { error } = await supabase.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Programação ──

export const getProgramacaoAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const supabase = await getAdminSupabase();
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
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { data: result, error } = await (supabase as any).from("programacao").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateProgramacao = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; day_of_week?: number; program_name?: string; presenter?: string; start_time?: string; end_time?: string; display_order?: number; is_active?: boolean }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any).from("programacao").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteProgramacao = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { error } = await (supabase as any).from("programacao").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Podcasts ──

export const getPodcastsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const supabase = await getAdminSupabase();
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
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { data: result, error } = await (supabase as any).from("podcasts").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updatePodcast = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; title?: string; description?: string; youtube_url?: string; thumbnail_url?: string; display_order?: number; is_active?: boolean }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any).from("podcasts").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deletePodcast = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { error } = await (supabase as any).from("podcasts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Admin User Management ──

export const createAdminUser = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
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
    await requireAdmin();
    const supabase = await getAdminSupabase();
    let q = (supabase as any).from("promotion_entries").select("*, promotions(title)").order("created_at", { ascending: false });
    if (data.promotion_id) q = q.eq("promotion_id", data.promotion_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows || [];
  });

export const deletePromotionEntry = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const { error } = await (supabase as any).from("promotion_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ── Upload media ──

export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { filename: string; contentType: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const supabase = await getAdminSupabase();
    const path = `uploads/${Date.now()}-${data.filename}`;
    const { data: result, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    return { signedUrl: result.signedUrl, token: result.token, path, publicUrl };
  });
