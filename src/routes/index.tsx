import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PromotionPopup } from "@/components/PromotionPopup";
import { PromotionDetailsModal } from "@/components/PromotionDetailsModal";
import { AudioActivationOverlay } from "@/components/AudioActivationOverlay";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import mascoteTop from "@/assets/mascote-top.png";
import illustMic from "@/assets/illust-microphone.png";
import illustDancer from "@/assets/illust-dancer.png";
import illustGift from "@/assets/illust-promo-gift.png";

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

type PodcastItem = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
};


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rádio TOP100 FM - Ao Vivo" },
      { name: "description", content: "Notícias, programação e podcasts da Rádio TOP100 FM. Ouça ao vivo!" },
      { property: "og:title", content: "Rádio TOP100 FM - Ao Vivo" },
      { property: "og:description", content: "Notícias, programação e podcasts da TOP100 FM." },
    ],
  }),
  component: IndexPage,
});

type NewsItem = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type ProgItem = {
  id: string;
  day_of_week: number;
  program_name: string;
  presenter: string | null;
  start_time: string;
  end_time: string;
};

type PromoItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
};

type Sponsor = {
  id: string;
  name: string;
  logo_url: string;
  link?: string;
  display_order?: number;
  is_active?: boolean;
};

const MOCK_PODCASTS: PodcastItem[] = [
  {
    id: "mock-pc-1",
    title: "TOP100 Entrevista — Bastidores do rádio",
    description: "Conversa exclusiva com nomes que fazem o rádio acontecer no Brasil.",
    youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail_url: null,
  },
  {
    id: "mock-pc-2",
    title: "Manhã TOP — Resenha da semana",
    description: "Os melhores momentos do programa matinal em formato podcast.",
    youtube_url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnail_url: null,
  },
  {
    id: "mock-pc-3",
    title: "Esporte TOP100 — Análise da rodada",
    description: "Tudo sobre futebol, com comentários quentes do nosso time.",
    youtube_url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    thumbnail_url: null,
  },
];

const svgLogo = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const MOCK_SPONSORS: Sponsor[] = [
  {
    id: "mock-sp-1",
    name: "Supermercado Boa Compra",
    logo_url: svgLogo(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'>
        <rect width='240' height='100' rx='14' fill='#c8102e'/>
        <g transform='translate(18,28)'>
          <path d='M6 8h32l-3 22a4 4 0 0 1-4 3H13a4 4 0 0 1-4-3L6 8z' fill='none' stroke='#fff' stroke-width='3' stroke-linejoin='round'/>
          <circle cx='15' cy='42' r='3.5' fill='#fff'/>
          <circle cx='32' cy='42' r='3.5' fill='#fff'/>
          <path d='M2 2h6l2 6' fill='none' stroke='#fff' stroke-width='3' stroke-linecap='round'/>
        </g>
        <text x='70' y='48' font-family='Arial,sans-serif' font-size='22' font-weight='900' fill='#fff'>BOA COMPRA</text>
        <text x='70' y='70' font-family='Arial,sans-serif' font-size='11' font-weight='700' fill='#ffd6dc' letter-spacing='2'>SUPERMERCADO</text>
      </svg>`,
    ),
    display_order: 1,
    is_active: true,
  },
  {
    id: "mock-sp-2",
    name: "Auto Posto Estrada",
    logo_url: svgLogo(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'>
        <rect width='240' height='100' rx='14' fill='#0c2651'/>
        <g transform='translate(20,26)'>
          <rect x='2' y='10' width='28' height='38' rx='3' fill='none' stroke='#ffc107' stroke-width='3'/>
          <rect x='6' y='14' width='20' height='12' fill='#ffc107'/>
          <path d='M30 22h6v22a4 4 0 0 1-4 4h-2' fill='none' stroke='#ffc107' stroke-width='3' stroke-linecap='round'/>
          <circle cx='38' cy='20' r='3' fill='#ffc107'/>
        </g>
        <text x='75' y='48' font-family='Arial,sans-serif' font-size='22' font-weight='900' fill='#fff'>ESTRADA</text>
        <text x='75' y='70' font-family='Arial,sans-serif' font-size='11' font-weight='700' fill='#ffc107' letter-spacing='2'>AUTO POSTO</text>
      </svg>`,
    ),
    display_order: 2,
    is_active: true,
  },
  {
    id: "mock-sp-3",
    name: "Farmácia Vida",
    logo_url: svgLogo(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'>
        <rect width='240' height='100' rx='14' fill='#16a34a'/>
        <g transform='translate(28,28)'>
          <rect x='14' y='2' width='12' height='40' rx='2' fill='#fff'/>
          <rect x='2' y='14' width='36' height='12' rx='2' fill='#fff'/>
        </g>
        <text x='80' y='48' font-family='Arial,sans-serif' font-size='24' font-weight='900' fill='#fff'>VIDA</text>
        <text x='80' y='70' font-family='Arial,sans-serif' font-size='11' font-weight='700' fill='#bbf7d0' letter-spacing='2'>FARMÁCIA</text>
      </svg>`,
    ),
    display_order: 3,
    is_active: true,
  },
  {
    id: "mock-sp-4",
    name: "Construtora Lar Bom",
    logo_url: svgLogo(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 100'>
        <rect width='240' height='100' rx='14' fill='#f59e0b'/>
        <g transform='translate(20,24)'>
          <path d='M4 28 L24 8 L44 28 V50 H4 Z' fill='none' stroke='#fff' stroke-width='3' stroke-linejoin='round'/>
          <rect x='18' y='34' width='12' height='16' fill='#fff'/>
          <rect x='10' y='32' width='6' height='6' fill='#fff'/>
          <rect x='32' y='32' width='6' height='6' fill='#fff'/>
        </g>
        <text x='80' y='48' font-family='Arial,sans-serif' font-size='22' font-weight='900' fill='#fff'>LAR BOM</text>
        <text x='80' y='70' font-family='Arial,sans-serif' font-size='11' font-weight='700' fill='#fff7d6' letter-spacing='2'>CONSTRUTORA</text>
      </svg>`,
    ),
    display_order: 4,
    is_active: true,
  },
];

const MOCK_PROMOS: PromoItem[] = [
  {
    id: "mock-1",
    title: "Ganhe um Smart TV 50''",
    description: "Cadastre-se e concorra ao grande prêmio do mês. Sorteio ao vivo na TOP100 FM.",
    image_url: null,
    link: "/promocoes",
  },
  {
    id: "mock-2",
    title: "Par de ingressos para o show",
    description: "Promoção exclusiva para ouvintes. Mostre que você é TOP e leve seu acompanhante.",
    image_url: null,
    link: "/promocoes",
  },
  {
    id: "mock-3",
    title: "Vale-compras de R$ 500",
    description: "Participe agora e concorra a fazer aquela compra dos sonhos por nossa conta.",
    image_url: null,
    link: "/promocoes",
  },
];
const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function fmtDate(d: string | null) {
  return new Date(d || Date.now()).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtTime(t: string) {
  return t?.slice(0, 5) || "";
}

function IndexPage() {
  useLoaderData({ from: "__root__" });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [prog, setProg] = useState<ProgItem[]>([]);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null);
  const [liveActive, setLiveActive] = useState(false);
  const [liveYoutubeId, setLiveYoutubeId] = useState<string | null>(null);
  const [liveTitle, setLiveTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const today = new Date().getDay();
  const nowHHMM = new Date().toTimeString().slice(0, 5);
  const currentProgram = prog.find((p) => p.start_time <= nowHHMM && p.end_time > nowHHMM) || prog[0];
  const upcomingPrograms = prog.filter((p) => p.start_time > nowHHMM).slice(0, 3);

  useEffect(() => {
    Promise.all([
      (supabase as any)
        .from("news")
        .select("id,title,summary,content,image_url,updated_at,created_at,is_pinned,pinned_at")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("pinned_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(7),
      (supabase as any)
        .from("programacao")
        .select("id,day_of_week,program_name,presenter,start_time,end_time")
        .eq("is_active", true)
        .eq("day_of_week", today)
        .neq("program_name", "__probe__")
        .order("start_time", { ascending: true }),
      supabase
        .from("promotions")
        .select("id,title,description,image_url,link")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(3),
      (supabase as any)
        .from("site_settings")
        .select("setting_key,setting_value")
        .eq("setting_key", "sponsors")
        .maybeSingle(),
      (supabase as any)
        .from("podcasts")
        .select("id,title,description,youtube_url,thumbnail_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(6),
      (supabase as any)
        .from("site_settings")
        .select("setting_key,setting_value")
        .in("setting_key", ["live_active", "live_youtube_url", "live_title"]),
    ]).then(([n, p, pr, sp, pc, ls]) => {
      setNews((n.data as any) || []);
      setProg((p.data as any) || []);
      const promoData = ((pr.data as any) || []) as PromoItem[];
      setPromos(promoData.length > 0 ? promoData : MOCK_PROMOS);
      try {
        const raw = (sp as any)?.data?.setting_value;
        const parsed = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : [];
        const list = (Array.isArray(parsed) ? parsed : []) as Sponsor[];
        const filtered = list
          .filter((s) => s.is_active !== false && s.logo_url)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        setSponsors(filtered.length > 0 ? filtered : MOCK_SPONSORS);
      } catch {
        setSponsors(MOCK_SPONSORS);
      }
      const pcData = ((pc as any)?.data as PodcastItem[]) || [];
      setPodcasts(pcData.length > 0 ? pcData : MOCK_PODCASTS);
      try {
        const rows = ((ls as any)?.data as Array<{ setting_key: string; setting_value: any }>) || [];
        const map = new Map(rows.map((r) => [r.setting_key, r.setting_value]));
        const parseVal = (v: any) => (typeof v === "string" ? (() => { try { return JSON.parse(v); } catch { return v; } })() : v);
        const active = parseVal(map.get("live_active"));
        const url = parseVal(map.get("live_youtube_url")) || "";
        const title = parseVal(map.get("live_title")) || "";
        setLiveActive(active === true || active === "true");
        setLiveYoutubeId(url ? getYoutubeId(String(url)) : null);
        setLiveTitle(typeof title === "string" ? title : "");
      } catch {}
      setLoading(false);
    });
  }, [today]);

  const featured = news[0];
  const secondary = news.slice(1, 3);
  const rest = news.slice(3, 7);

  return (
    <div style={{ width: "100%", margin: 0 }}>
      <SiteHeader />
      <PromotionPopup />
      <AudioActivationOverlay />

      <main className="bg-background">
        {/* PÓDIO — Hero das Promoções (estilo Spotify/Apple Music) */}
        <section className="relative overflow-hidden bg-[#0a1f4a]">
          {/* fundo: gradiente vivo + grid sutil + glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#1a3a8c_0%,#0a1f4a_45%,#06122d_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#c8102e]/40 blur-[120px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.85, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-[#ffd84d]/20 blur-[140px]"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-20 lg:pt-16 lg:pb-24">
            <div className="grid items-center gap-8 lg:gap-6 lg:grid-cols-[1fr_0.65fr_0.85fr]">
              {/* Texto */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffd84d] backdrop-blur"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffd84d] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ffd84d]" />
                  </span>
                  Promoções no ar
                </motion.span>

                <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight text-white">
                  Ouça, dance e{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-[#ffd84d] via-[#ff9a3c] to-[#ff5470] bg-clip-text text-transparent">
                      concorra.
                    </span>
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-[#ffd84d] via-[#ff9a3c] to-[#ff5470] opacity-30"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                      style={{ originX: 0 }}
                    />
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-white/70">
                  Participe das promoções da TOP100 FM e leve prêmios sem sair do ritmo. Ingressos, brindes e experiências exclusivas todo mês.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/promocoes"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0c2651] shadow-[0_12px_30px_-10px_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(255,255,255,0.6)]"
                  >
                    Quero participar
                    <span className="transition group-hover:translate-x-0.5">→</span>
                  </Link>
                  <Link
                    to="/promocoes"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    Ver todas
                  </Link>
                </div>

                {/* mini-stats */}
                <div className="mt-10 flex flex-wrap gap-8 border-t border-white/10 pt-6">
                  {[
                    { n: "12+", l: "Promoções ativas" },
                    { n: "98.5", l: "FM ao vivo" },
                    { n: "24/7", l: "No ar" },
                  ].map((s, idx) => (
                    <motion.div
                      key={s.l}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                    >
                      <div className="text-2xl font-black text-white">{s.n}</div>
                      <div className="text-[11px] uppercase tracking-widest text-white/50">{s.l}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Card dinâmico: Live YouTube ou Programação ao vivo */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* halo de fundo */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-[#c8102e]/30 via-[#ff5470]/20 to-[#ffd84d]/30 blur-2xl"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                {liveActive && liveYoutubeId ? (
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#c8102e] to-[#a00d24]">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Ao vivo agora</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">YouTube</span>
                    </div>
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${liveYoutubeId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                        title={liveTitle || "Transmissão ao vivo"}
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                    {liveTitle && (
                      <div className="px-4 py-3 bg-white/5">
                        <p className="text-sm font-bold text-white line-clamp-1">{liveTitle}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 lg:p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 border border-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ffd84d]" />
                        Programação de hoje
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{DAYS[today]}</span>
                    </div>

                    {currentProgram ? (
                      <div className="mt-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffd84d]">No ar</p>
                        <h3 className="mt-1 text-2xl lg:text-3xl font-black text-white leading-tight">
                          {currentProgram.program_name}
                        </h3>
                        {currentProgram.presenter && (
                          <p className="mt-1 text-sm text-white/70">com {currentProgram.presenter}</p>
                        )}
                        <p className="mt-2 text-xs text-white/50 font-mono tracking-wider">
                          {fmtTime(currentProgram.start_time)} — {fmtTime(currentProgram.end_time)}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffd84d]">Música 24/7</p>
                        <h3 className="mt-1 text-2xl lg:text-3xl font-black text-white leading-tight">O melhor da TOP100 FM</h3>
                        <p className="mt-1 text-sm text-white/70">Sem programa ao vivo agora — siga curtindo no rádio.</p>
                      </div>
                    )}

                    {upcomingPrograms.length > 0 && (
                      <div className="mt-6 border-t border-white/10 pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">A seguir</p>
                        <ul className="space-y-2.5">
                          {upcomingPrograms.map((u) => (
                            <li key={u.id} className="flex items-center justify-between gap-3 text-sm">
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{u.program_name}</p>
                                {u.presenter && <p className="text-xs text-white/50 truncate">{u.presenter}</p>}
                              </div>
                              <span className="shrink-0 text-xs font-mono text-[#ffd84d]/90">{fmtTime(u.start_time)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link
                      to="/programacao"
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white/90 hover:text-[#ffd84d] transition"
                    >
                      Ver programação completa <span>→</span>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* divisor com curva */}
          <svg className="block w-full h-12 lg:h-16 text-background" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
            <path fill="currentColor" d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </section>

        {/* GRID DE PROMOÇÕES */}
        <section className="bg-background py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8102e]">
                  Em destaque
                </p>
                <h2 className="mt-1 text-2xl md:text-3xl font-black text-[#0c2651] tracking-tight leading-none">
                  Promoções da semana
                </h2>
              </div>
              <Link
                to="/promocoes"
                className="group inline-flex items-center gap-1.5 rounded-full border border-[#c8102e]/20 bg-white px-4 py-2 text-sm font-bold text-[#c8102e] shadow-sm transition hover:bg-[#c8102e] hover:text-white hover:shadow-md"
              >
                Ver todas
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {promos.slice(0, 3).map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPromo(p)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-[#c8102e]/40 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col text-left cursor-pointer"
                >
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#c8102e] shadow-sm border border-[#c8102e]/20">
                    🎁 Promo #{i + 1}
                  </div>
                  <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#c8102e] via-[#a00d24] to-[#0c2651] relative">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img src={illustGift} alt="" className="h-32 w-32 object-contain anim-float drop-shadow-xl" loading="lazy" width={128} height={128} />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-lg text-[#0c2651] leading-tight group-hover:text-[#c8102e] transition line-clamp-2">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#c8102e] group-hover:gap-2.5 transition-all">
                      Quero participar
                      <span>→</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* HERO + NOTÍCIAS DESTAQUE */}
        <section className="mx-auto max-w-7xl px-4 pt-8 pb-12">
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#c8102e] to-[#0c2651]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">
                  Em alta
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-[#0c2651] tracking-tight leading-none">
                  Últimas Notícias
                </h2>
              </div>
            </div>
            <Link
              to="/noticias"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#c8102e]/20 bg-white px-4 py-2 text-sm font-bold text-[#c8102e] shadow-sm transition hover:bg-[#c8102e] hover:text-white hover:shadow-md"
            >
              Ver todas
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-card animate-pulse h-72" />
              ))}
            </div>
          ) : !featured ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <p className="text-lg text-muted-foreground">Nenhuma notícia publicada ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">Cadastre no painel administrativo.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* DESTAQUE GRANDE */}
              <Link
                to="/noticias"
                className="lg:col-span-2 group relative rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-xl transition"
              >
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {featured.image_url ? (
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#c8102e] to-[#0c2651] flex items-center justify-center">
                      <span className="text-white text-7xl">📻</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                  <span className="inline-block bg-[#c8102e] text-white text-xs font-bold uppercase px-2 py-1 rounded mb-2">
                    Destaque
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white leading-tight line-clamp-3">
                    {featured.title}
                  </h3>
                  {featured.summary && (
                    <p className="mt-2 text-white/90 text-sm md:text-base line-clamp-2">
                      {featured.summary}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-white/70 uppercase tracking-wider">
                    {fmtDate(featured.updated_at || featured.created_at)}
                  </p>
                </div>
              </Link>

              {/* 2 SECUNDÁRIAS */}
              <div className="grid gap-6 grid-cols-1">
                {secondary.map((n) => (
                  <Link
                    key={n.id}
                    to="/noticias"
                    className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition flex"
                  >
                    {n.image_url ? (
                      <div className="w-32 sm:w-40 flex-shrink-0 bg-muted">
                        <img src={n.image_url} alt={n.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-32 sm:w-40 flex-shrink-0 bg-gradient-to-br from-[#c8102e] to-[#0c2651]" />
                    )}
                    <div className="p-4 flex-1">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-[#c8102e] mb-1">
                        {fmtDate(n.updated_at || n.created_at)}
                      </p>
                      <h4 className="font-bold text-[#0c2651] leading-snug line-clamp-3 group-hover:text-[#c8102e] transition">
                        {n.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* MAIS NOTÍCIAS */}
          {rest.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((n) => (
                <Link
                  key={n.id}
                  to="/noticias"
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    {n.image_url ? (
                      <img src={n.image_url} alt={n.title} className="w-full h-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#c8102e] to-[#0c2651]" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] uppercase font-bold text-[#c8102e] mb-1">
                      {fmtDate(n.updated_at || n.created_at)}
                    </p>
                    <h4 className="font-bold text-sm text-[#0c2651] line-clamp-2">{n.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>


        {/* PROGRAMAÇÃO DO DIA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2651] via-[#0c2651] to-[#1a3a7a] text-white py-14">
          <img
            src={illustMic}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={240}
            height={240}
            className="hidden md:block absolute right-6 top-6 h-48 w-48 object-contain opacity-90 anim-float-slow drop-shadow-2xl pointer-events-none"
          />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-[#c8102e]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">
                    Hoje · {DAYS[today]}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white">
                    Programação do Dia
                  </h2>
                </div>
              </div>
              <Link
                to="/programacao"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-[#0c2651]"
              >
                Ver semana
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            {prog.filter((p) => p.program_name !== "__probe__").length === 0 ? (
              <div className="rounded-xl bg-white/5 p-8 text-center text-white/70">
                Nenhum programa cadastrado para hoje.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {prog.filter((p) => p.program_name !== "__probe__").map((p) => {
                  const isLive = nowHHMM >= p.start_time.slice(0, 5) && nowHHMM < p.end_time.slice(0, 5);
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl p-4 border transition ${
                        isLive
                          ? "bg-[#c8102e] border-[#c8102e] shadow-lg shadow-red-900/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold">
                          {fmtTime(p.start_time)} – {fmtTime(p.end_time)}
                        </span>
                        {isLive && (
                          <span className="text-[10px] uppercase font-black bg-white text-[#c8102e] px-1.5 py-0.5 rounded animate-pulse">
                            No ar
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold leading-tight">{p.program_name}</h4>
                      {p.presenter && <p className="text-xs text-white/70 mt-1">com {p.presenter}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* PATROCINADORES */}
        {sponsors.length > 0 && (
          <section className="bg-white py-14 border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#c8102e] to-[#0c2651]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8102e]">
                      Quem apoia
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black text-[#0c2651] tracking-tight leading-none mt-0.5">
                      Nossos Patrocinadores
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs hidden md:block">
                  Marcas que acreditam no rádio e fazem a TOP100 FM acontecer todos os dias.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {sponsors.map((s) => {
                  const Wrapper: any = s.link ? "a" : "div";
                  const wrapperProps = s.link
                    ? { href: s.link, target: "_blank", rel: "noopener" }
                    : {};
                  return (
                    <Wrapper
                      key={s.id}
                      {...wrapperProps}
                      className={`group relative rounded-2xl border border-gray-200 bg-white ${
                        s.link
                          ? "hover:border-[#c8102e]/40 hover:shadow-lg hover:-translate-y-1"
                          : ""
                      } transition-all duration-300 flex flex-col items-center justify-center text-center p-5 gap-3 min-h-[160px]`}
                    >
                      <div className="flex items-center justify-center h-16 w-full">
                        <img
                          src={s.logo_url}
                          alt={s.name}
                          className="max-h-16 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="text-sm font-bold text-[#0c2651] group-hover:text-[#c8102e] transition tracking-tight leading-tight line-clamp-2">
                        {s.name}
                      </div>
                    </Wrapper>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <a
                  href="mailto:contato@top100fm.com.br?subject=Quero%20ser%20patrocinador"
                  className="inline-flex items-center gap-2 rounded-full border border-[#c8102e]/30 bg-white px-5 py-2.5 text-sm font-bold text-[#c8102e] hover:bg-[#c8102e] hover:text-white hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  Quero anunciar na TOP100 FM
                  <span>→</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* PODCASTS — mesma estética da Programação */}
        {podcasts.length > 0 && (
          <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2651] via-[#0c2651] to-[#1a3a7a] text-white py-14">
            <img
              src={illustDancer}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={240}
              height={240}
              className="hidden md:block absolute right-4 top-2 h-56 w-56 object-contain opacity-95 anim-wiggle drop-shadow-2xl pointer-events-none"
            />
            <div className="relative mx-auto max-w-7xl px-4">
              <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1.5 rounded-full bg-[#ffc107]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffc107]">
                      🎧 No ar quando quiser
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white">
                      Podcasts
                    </h2>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {podcasts.map((p) => {
                  const ytId = getYoutubeId(p.youtube_url);
                  const thumb = p.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");
                  const isPlaying = playingPodcast === p.id;
                  return (
                    <article
                      key={p.id}
                      className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition flex flex-col"
                    >
                      <div className="relative aspect-video bg-black/40 overflow-hidden">
                        {isPlaying && ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                            title={p.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPlayingPodcast(p.id)}
                            className="group w-full h-full flex items-center justify-center bg-cover bg-center"
                            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                            aria-label={`Reproduzir ${p.title}`}
                          >
                            <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffc107] text-[#0c2651] shadow-xl group-hover:scale-110 transition">
                              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <h4 className="font-bold leading-tight text-white line-clamp-2">{p.title}</h4>
                        {p.description && (
                          <p className="text-xs text-white/70 line-clamp-2">{p.description}</p>
                        )}
                        <div className="mt-auto pt-2 flex items-center gap-2">
                          {!isPlaying && (
                            <button
                              onClick={() => setPlayingPodcast(p.id)}
                              className="text-[11px] uppercase font-black bg-[#ffc107] text-[#0c2651] px-3 py-1.5 rounded-full hover:bg-white transition"
                            >
                              ▶ Escutar
                            </button>
                          )}
                          <a
                            href={p.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] uppercase font-bold text-white/70 hover:text-white transition"
                          >
                            YouTube ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />

      {selectedPromo && (
        <PromotionDetailsModal
          promo={selectedPromo}
          onClose={() => setSelectedPromo(null)}
        />
      )}
    </div>
  );
}
