import { createServerFn } from "@tanstack/react-start";

async function getPublicSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export const getActivePromotions = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicSupabase();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  return data || [];
});

export const getPublishedNews = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicSupabase();
  const { data } = await (supabase as any)
    .from("news")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("display_order", { ascending: true })
    .order("updated_at", { ascending: false });
  return data || [];
});

export const getProgramacao = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicSupabase();
  const { data } = await (supabase as any)
    .from("programacao")
    .select("*")
    .eq("is_active", true)
    .neq("program_name", "__probe__")
    .order("day_of_week")
    .order("start_time");
  return (data || []) as ProgramacaoItem[];
});

export type ProgramacaoItem = {
  id: string;
  day_of_week: number;
  program_name: string;
  presenter: string | null;
  start_time: string;
  end_time: string;
  display_order: number;
  is_active: boolean;
};

export type PodcastItem = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
};

export const submitPromotionEntry = createServerFn({ method: "POST" })
  .inputValidator((input: { promotion_id: string; full_name: string; whatsapp: string; cpf: string; instagram: string; facebook: string }) => {
    const trim = (s: string) => (s || "").trim();
    const data = {
      promotion_id: trim(input.promotion_id),
      full_name: trim(input.full_name),
      whatsapp: trim(input.whatsapp),
      cpf: trim(input.cpf).replace(/\D/g, ""),
      instagram: trim(input.instagram),
      facebook: trim(input.facebook),
    };
    if (!data.promotion_id) throw new Error("Promoção inválida");
    if (data.full_name.length < 3 || data.full_name.length > 120) throw new Error("Nome inválido");
    if (data.whatsapp.replace(/\D/g, "").length < 10) throw new Error("WhatsApp inválido");
    if (data.cpf.length !== 11) throw new Error("CPF deve ter 11 dígitos");
    if (!data.instagram || data.instagram.length > 80) throw new Error("Instagram obrigatório");
    if (!data.facebook || data.facebook.length > 120) throw new Error("Facebook obrigatório");
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = await getPublicSupabase();
    const { error } = await (supabase as any).from("promotion_entries").insert(data);
    if (error) {
      if (error.code === "23505") throw new Error("Este CPF já foi cadastrado nesta promoção.");
      throw new Error(error.message);
    }
    return { success: true };
  });

export const getActivePodcasts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicSupabase();
  const { data } = await (supabase as any)
    .from("podcasts")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("created_at", { ascending: false });
  return (data || []) as PodcastItem[];
});

// ── Site Settings (Public) ──

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getPublicSupabase();
  const { data } = await (supabase as any).from("site_settings").select("*");

  const settings: Record<string, any> = {};
  (data || []).forEach((row: any) => {
    try {
      settings[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      settings[row.setting_key] = row.setting_value;
    }
  });
  return settings;
});
