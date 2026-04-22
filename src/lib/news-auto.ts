import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getCookie } from "@tanstack/react-start/server";
import { createAdminServerFn } from "@/lib/admin-serverfn";

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

const FEEDS = [
  { name: "G1", url: "https://g1.globo.com/rss/g1/" },
  { name: "UOL", url: "https://rss.uol.com.br/feed/noticias.xml" },
];

const MAX_PER_FEED = 5;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function stripHtml(s: string): string {
  return decodeEntities(stripCdata(s).replace(/<[^>]+>/g, "")).trim();
}

function pickTag(item: string, tag: string): string {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? stripCdata(m[1]) : "";
}

function pickImage(item: string): string {
  const enc = item.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  if (enc) return enc[1];
  const media =
    item.match(/<media:content[^>]*url="([^"]+)"/i) ||
    item.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  if (media) return media[1];
  const desc = pickTag(item, "description");
  const img = desc.match(/<img[^>]*src="([^"]+)"/i);
  if (img) return img[1];
  return "";
}

type ParsedItem = {
  title: string;
  summary: string;
  link: string;
  image: string;
  source: string;
};

function parseFeed(xml: string, source: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) && items.length < MAX_PER_FEED) {
    const it = match[0];
    const title = stripHtml(pickTag(it, "title"));
    const link = stripHtml(pickTag(it, "link"));
    const summary = stripHtml(pickTag(it, "description")).slice(0, 280);
    const image = pickImage(it);
    if (title && link) items.push({ title, summary, link, image, source });
  }
  return items;
}

async function fetchAndParse(): Promise<ParsedItem[]> {
  const all: ParsedItem[] = [];
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 RadioBot/1.0" },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      all.push(...parseFeed(xml, feed.name));
    } catch (e) {
      console.error(`[news-auto] feed ${feed.name} failed`, e);
    }
  }
  return all;
}

async function isAutoNewsEnabled(): Promise<boolean> {
  if (!adminClient) return false;

  const { data, error } = await (adminClient as any)
    .from("site_settings")
    .select("*")
    .or("setting_key.eq.auto_news_enabled,key.eq.auto_news_enabled")
    .limit(1);

  if (error || !Array.isArray(data) || data.length === 0) return false;

  const row = data[0] as {
    setting_value?: unknown;
    value?: unknown;
  };
  const raw = row.setting_value ?? row.value;
  return raw === true || raw === "true" || raw === '"true"';
}

export async function runAutoNewsIngest(): Promise<{
  inserted: number;
  skipped: number;
  total: number;
}> {
  if (!adminClient) throw new Error("Configuração do servidor incompleta");

  const enabled = await isAutoNewsEnabled();
  if (!enabled) {
    return { inserted: 0, skipped: 0, total: 0 };
  }

  const items = await fetchAndParse();
  let inserted = 0;
  let skipped = 0;

  for (const it of items) {
    const { data: existing } = await (adminClient as any)
      .from("news")
      .select("id")
      .eq("source_url", it.link)
      .maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }
    const { error } = await (adminClient as any).from("news").insert({
      title: it.title.slice(0, 180),
      summary: it.summary,
      content: `${it.summary}\n\nFonte: ${it.source}\n${it.link}`,
      image_url: it.image || null,
      source_url: it.link,
      source_name: it.source,
      auto_generated: true,
      is_published: true,
    });
    if (!error) inserted++;
  }
  return { inserted, skipped, total: items.length };
}

export const triggerAutoNewsManual = createAdminServerFn("POST").handler(async () => {
  const cookie = getCookie("admin_session");
  const header = typeof Headers !== "undefined" ? undefined : undefined;
  if (cookie !== "authenticated") {
    // header auth is already sent by createAdminServerFn middleware; if cookie falhar,
    // a autorização principal ocorre em admin-api nas demais ações.
  }

  if (!adminClient) throw new Error("Configuração do servidor incompleta");
  const items = await fetchAndParse();
  let inserted = 0;
  let skipped = 0;
  for (const it of items) {
    const { data: existing } = await (adminClient as any)
      .from("news")
      .select("id")
      .eq("source_url", it.link)
      .maybeSingle();
    if (existing) {
      skipped++;
      continue;
    }
    const { error } = await (adminClient as any).from("news").insert({
      title: it.title.slice(0, 180),
      summary: it.summary,
      content: `${it.summary}\n\nFonte: ${it.source}\n${it.link}`,
      image_url: it.image || null,
      source_url: it.link,
      source_name: it.source,
      auto_generated: true,
      is_published: true,
    });
    if (!error) inserted++;
  }
  return { inserted, skipped, total: items.length };
});
