import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getProgramacao, type ProgramacaoItem } from "@/lib/public-api";

export const Route = createFileRoute("/programacao")({
  head: () => ({
    meta: [
      { title: "Programação | TOP100 FM" },
      { name: "description", content: "Confira a programação completa da Rádio TOP100 FM dia a dia." },
      { property: "og:title", content: "Programação | TOP100 FM" },
      { property: "og:description", content: "Programação completa da TOP100 FM." },
    ],
  }),
  loader: () => getProgramacao(),
  component: ProgramacaoPage,
});

const DAYS = [
  { idx: 0, label: "Domingo", short: "Dom" },
  { idx: 1, label: "Segunda", short: "Seg" },
  { idx: 2, label: "Terça", short: "Ter" },
  { idx: 3, label: "Quarta", short: "Qua" },
  { idx: 4, label: "Quinta", short: "Qui" },
  { idx: 5, label: "Sexta", short: "Sex" },
  { idx: 6, label: "Sábado", short: "Sáb" },
];

const fmt = (t: string) => t?.slice(0, 5) ?? "";

function ProgramacaoPage() {
  const items = (Route.useLoaderData() as ProgramacaoItem[]).filter(
    (p) => p.program_name !== "__probe__"
  );
  const today = new Date().getDay();
  const [day, setDay] = useState<number>(today);
  const [now, setNow] = useState(() => new Date().toTimeString().slice(0, 5));

  useEffect(() => {
    setDay(new Date().getDay());
    const t = setInterval(() => setNow(new Date().toTimeString().slice(0, 5)), 30_000);
    return () => clearInterval(t);
  }, []);

  const dayItems = useMemo(
    () => items.filter((p) => p.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [items, day]
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0c2651] via-[#0c2651] to-[#1a3a7a] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-8 w-1.5 rounded-full bg-[#c8102e]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c8102e]">
              Grade semanal
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Nossa Programação
          </h1>
          <p className="mt-3 text-white/70 max-w-xl">
            Acompanhe os programas da TOP100 FM ao longo da semana. Toque em um dia para ver a grade completa.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* TABS DE DIAS */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
          {DAYS.map((d) => {
            const active = day === d.idx;
            const isToday = today === d.idx;
            return (
              <button
                key={d.idx}
                onClick={() => setDay(d.idx)}
                className={`group relative px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition shadow-sm ${
                  active
                    ? "bg-[#c8102e] text-white shadow-lg shadow-red-900/20 scale-105"
                    : "bg-white text-[#0c2651] border border-gray-200 hover:border-[#c8102e]/40 hover:text-[#c8102e]"
                }`}
              >
                <span className="md:hidden">{d.short}</span>
                <span className="hidden md:inline">{d.label}</span>
                {isToday && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white text-[#c8102e]" : "bg-[#c8102e] text-white"
                    }`}
                  >
                    HOJE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* LISTA DE PROGRAMAS */}
        {dayItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="text-5xl mb-3">🎙️</div>
            <p className="text-lg font-bold text-[#0c2651]">
              Sem programas cadastrados para {DAYS[day].label.toLowerCase()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              A grade está sendo atualizada. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {dayItems.map((p) => {
              const isLive = day === today && now >= fmt(p.start_time) && now < fmt(p.end_time);
              return (
                <article
                  key={p.id}
                  className={`group relative overflow-hidden rounded-2xl border bg-white transition hover:shadow-md ${
                    isLive
                      ? "border-[#c8102e] shadow-lg shadow-red-900/10 ring-1 ring-[#c8102e]/30"
                      : "border-gray-200"
                  }`}
                >
                  {/* Barra lateral */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isLive ? "bg-[#c8102e]" : "bg-gradient-to-b from-[#0c2651] to-[#1a3a7a]"
                    }`}
                  />
                  <div className="flex items-center gap-4 md:gap-6 p-5 pl-7">
                    {/* Horário */}
                    <div className="text-center min-w-[90px] md:min-w-[110px]">
                      <div className="text-2xl md:text-3xl font-black text-[#0c2651] leading-none font-mono tabular-nums">
                        {fmt(p.start_time)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                        até {fmt(p.end_time)}
                      </div>
                    </div>

                    {/* Linha vertical */}
                    <div className="h-12 w-px bg-gray-200" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-lg md:text-xl text-[#0c2651] truncate">
                          {p.program_name}
                        </h3>
                        {isLive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-[#c8102e] text-white px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                            No ar
                          </span>
                        )}
                      </div>
                      {p.presenter && (
                        <p className="text-sm text-muted-foreground">
                          <span className="text-[#c8102e] font-semibold">com</span> {p.presenter}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* CTA voltar home */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c8102e] hover:underline"
          >
            ← Voltar para a home
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
