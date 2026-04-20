import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PromotionPopup } from "@/components/PromotionPopup";
import { AudioActivationOverlay } from "@/components/AudioActivationOverlay";
import { PodcastsSection } from "@/components/PodcastsSection";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rádio TOP100 FM - Ao Vivo" },
      {
        name: "description",
        content: "Ouça a Rádio TOP100 FM ao vivo. A melhor programação musical para você!",
      },
      { property: "og:title", content: "Rádio TOP100 FM - Ao Vivo" },
      { property: "og:description", content: "Ouça a Rádio TOP100 FM ao vivo." },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { settings } = useLoaderData({ from: "__root__" }) as { settings?: Record<string, any> };
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("news")
      .select("id,title,summary,image_url,updated_at,created_at")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(9)
      .then(({ data }) => {
        setNews(data || []);
        setLoading(false);
      });
  }, []);

  const fmtDate = (d: string | null) =>
    new Date(d || Date.now()).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{ width: "100%", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", margin: 0 }}>
      <SiteHeader />
      <PromotionPopup />
      <AudioActivationOverlay />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0c2651]">Últimas Notícias</h1>
            <p className="text-muted-foreground mt-1">Fique por dentro do que rola na TOP100 FM.</p>
          </div>
          <Link
            to="/noticias"
            className="text-sm font-bold text-[#c8102e] hover:underline"
          >
            Ver todas →
          </Link>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <p className="text-lg text-muted-foreground">Nenhuma notícia publicada ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cadastre notícias no painel administrativo.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.id}
                to="/noticias"
                className="group cursor-pointer rounded-xl border bg-card overflow-hidden transition hover:shadow-lg hover:-translate-y-1"
              >
                {n.image_url ? (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={n.image_url}
                      alt={n.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#c8102e] to-[#0c2651] flex items-center justify-center">
                    <span className="text-white text-5xl">📻</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wider font-bold text-[#c8102e] mb-2">
                    {fmtDate(n.updated_at || n.created_at)}
                  </div>
                  <h2 className="font-bold text-lg text-[#0c2651] leading-snug line-clamp-2">
                    {n.title}
                  </h2>
                  {n.summary && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.summary}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <PodcastsSection />
      <SiteFooter />
    </div>
  );
}
