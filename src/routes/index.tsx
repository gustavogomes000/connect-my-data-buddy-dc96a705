import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PromotionPopup } from "@/components/PromotionPopup";
import { PromotionDetailsModal } from "@/components/PromotionDetailsModal";
import { AudioActivationOverlay } from "@/components/AudioActivationOverlay";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(true);
  const today = new Date().getDay();
  const nowHHMM = new Date().toTimeString().slice(0, 5);

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
    ]).then(([n, p, pr, sp, pc]) => {
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
        {/* PROMOÇÕES EM DESTAQUE — TOPO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8f0] via-white to-[#fff0f3] py-14 border-b border-[#c8102e]/10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#c8102e]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#0c2651]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#c8102e] to-[#ff5470]" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8102e] flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8102e] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c8102e]" />
                    </span>
                    Promoções no ar
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black text-[#0c2651] tracking-tight leading-none mt-1">
                    Participe e concorra
                  </h2>
                </div>
              </div>
              <Link
                to="/promocoes"
                className="group inline-flex items-center gap-1.5 rounded-full bg-[#c8102e] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(200,16,46,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(200,16,46,0.7)]"
              >
                Ver todas
                <span className="transition group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {promos.slice(0, 3).map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPromo(p)}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-[#c8102e]/40 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col text-left cursor-pointer"
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
                          <span className="text-white/90 text-6xl drop-shadow-lg">🎉</span>
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
                </button>
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
        <section className="bg-gradient-to-br from-[#0c2651] via-[#0c2651] to-[#1a3a7a] text-white py-14">
          <div className="mx-auto max-w-7xl px-4">
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
          <section className="bg-gradient-to-br from-[#0c2651] via-[#0c2651] to-[#1a3a7a] text-white py-14">
            <div className="mx-auto max-w-7xl px-4">
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
