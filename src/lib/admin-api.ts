import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createAdminServerFn } from "@/lib/admin-serverfn";
import { runManualNewsIngest } from "./news-auto";

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

const adminClient: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

function getAdminSupabase(): SupabaseClient {
  if (!adminClient) throw new Error("Configuração do servidor incompleta");
  return adminClient;
}

async function ensureAdmin() {
  const { requireAdmin } = await import("./admin-guard.server");
  await await ensureAdmin();
}

export const getPromotions = createAdminServerFn("GET").handler(async () => {
  await ensureAdmin();
  const supabase = getAdminSupabase();
  const { data } = await supabase.from("promotions").select("*").order("display_order");
  return data || [];
});

export const createPromotion = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      title: string;
      description?: string;
      image_url?: string;
      link?: string;
      popup_duration_seconds?: number;
      show_as_popup?: boolean;
      display_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase
      .from("promotions")
      .insert({ ...data, is_active: true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updatePromotion = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      id: string;
      title?: string;
      description?: string;
      image_url?: string;
      link?: string;
      is_active?: boolean;
      popup_duration_seconds?: number;
      show_as_popup?: boolean;
      display_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await supabase
      .from("promotions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deletePromotion = createAdminServerFn("POST")
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("promotions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getNews = createAdminServerFn("GET").handler(async () => {
  await ensureAdmin();
  const supabase = getAdminSupabase();
  const { data } = await (supabase as any)
    .from("news")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  return data || [];
});

export const createNews = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      title: string;
      content?: string;
      summary?: string;
      image_url?: string;
      podcast_link?: string;
      display_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await supabase.from("news").insert(data).select().single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateNews = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      id: string;
      title?: string;
      content?: string;
      summary?: string;
      image_url?: string;
      podcast_link?: string;
      is_published?: boolean;
      is_pinned?: boolean;
      pinned_at?: string | null;
      display_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any)
      .from("news")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteNews = createAdminServerFn("POST")
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getProgramacaoAdmin = createAdminServerFn("GET").handler(async () => {
  await ensureAdmin();
  const supabase = getAdminSupabase();
  const { data } = await (supabase as any)
    .from("programacao")
    .select("*")
    .order("day_of_week")
    .order("start_time");
  return data || [];
});

export const createProgramacao = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      day_of_week: number;
      program_name: string;
      presenter?: string;
      start_time: string;
      end_time: string;
      display_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await (supabase as any)
      .from("programacao")
      .insert({ ...data, is_active: true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updateProgramacao = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      id: string;
      day_of_week?: number;
      program_name?: string;
      presenter?: string;
      start_time?: string;
      end_time?: string;
      display_order?: number;
      is_active?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any)
      .from("programacao")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deleteProgramacao = createAdminServerFn("POST")
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { error } = await (supabase as any).from("programacao").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getPodcastsAdmin = createAdminServerFn("GET").handler(async () => {
  await ensureAdmin();
  const supabase = getAdminSupabase();
  const { data } = await (supabase as any)
    .from("podcasts")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });
  return data || [];
});

export const createPodcast = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      title: string;
      description?: string;
      youtube_url: string;
      thumbnail_url?: string;
      display_order?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { data: result, error } = await (supabase as any)
      .from("podcasts")
      .insert({ ...data, is_active: true })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const updatePodcast = createAdminServerFn("POST")
  .inputValidator(
    (input: {
      id: string;
      title?: string;
      description?: string;
      youtube_url?: string;
      thumbnail_url?: string;
      display_order?: number;
      is_active?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = data;
    const { data: result, error } = await (supabase as any)
      .from("podcasts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return result;
  });

export const deletePodcast = createAdminServerFn("POST")
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { error } = await (supabase as any).from("podcasts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const createAdminUser = createAdminServerFn("POST")
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { error } = await supabase.rpc("admin_create_user", {
      p_username: data.username,
      p_password: data.password,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getPromotionEntries = createAdminServerFn("POST")
  .inputValidator((input: { promotion_id?: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    let q = (supabase as any)
      .from("promotion_entries")
      .select("*, promotions(title)")
      .order("created_at", { ascending: false });
    if (data.promotion_id) q = q.eq("promotion_id", data.promotion_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows || [];
  });

export const deletePromotionEntry = createAdminServerFn("POST")
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const { error } = await (supabase as any).from("promotion_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getUploadUrl = createAdminServerFn("POST")
  .inputValidator((input: { filename: string; contentType: string }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/${Date.now()}-${safeName}`;
    const { data: result, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const publicUrl = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    return { signedUrl: result.signedUrl, token: result.token, path, publicUrl };
  });

export const triggerAutoNewsManual = createAdminServerFn("POST").handler(async () => {
  await ensureAdmin();
  return runManualNewsIngest();
});

export const getSiteSettings = createAdminServerFn("GET").handler(async () => {
  await ensureAdmin();
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) throw new Error(error.message);

  const settings: Record<string, any> = {};
  data?.forEach((row) => {
    try {
      settings[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      settings[row.setting_key] = row.setting_value;
    }
  });
  return settings;
});

export const updateSiteSettings = createAdminServerFn("POST")
  .inputValidator((input: { key: string; value: any }) => input)
  .handler(async ({ data }) => {
    await ensureAdmin();
    const supabase = getAdminSupabase();

    const stringValue = typeof data.value === "object" ? JSON.stringify(data.value) : String(data.value);

    const { error } = await supabase.from("site_settings").upsert(
      {
        setting_key: data.key,
        setting_value: stringValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "setting_key" },
    );

    if (error) throw new Error(error.message);
    return { success: true };
  });
