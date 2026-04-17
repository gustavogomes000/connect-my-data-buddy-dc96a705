import { createFileRoute } from "@tanstack/react-router";
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
  { idx: 0, label: "Domingo" },
  { idx: 1, label: "Segunda-Feira" },
  { idx: 2, label: "Terça-Feira" },
  { idx: 3, label: "Quarta-Feira" },
  { idx: 4, label: "Quinta-Feira" },
  { idx: 5, label: "Sexta-Feira" },
  { idx: 6, label: "Sábado" },
];

function ProgramacaoPage() {
  const items = Route.useLoaderData() as ProgramacaoItem[];
  const today = new Date().getDay();
  const [day, setDay] = useState<number>(today);

  useEffect(() => {
    setDay(new Date().getDay());
  }, []);

  const todayItems = useMemo(
    () => items.filter((p) => p.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [items, day]
  );

  const fmt = (t: string) => t?.slice(0, 5) ?? "";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-black text-[#c8102e] mb-6 tracking-wide">NOSSA PROGRAMAÇÃO</h1>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Day pills */}
          <aside className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {DAYS.map((d) => (
              <button
                key={d.idx}
                onClick={() => setDay(d.idx)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-semibold whitespace-nowrap transition ${
                  day === d.idx
                    ? "bg-[#c8102e] text-white border-[#c8102e] shadow-md"
                    : "bg-white text-[#c8102e] border-[#c8102e] hover:bg-[#c8102e]/10"
                }`}
              >
                {d.label}
              </button>
            ))}
          </aside>

          {/* Schedule list */}
          <section className="flex flex-col gap-3">
            {todayItems.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                Nenhum programa cadastrado para {DAYS[day].label.toLowerCase()}.
              </div>
            ) : (
              todayItems.map((p, i) => {
                const isAccent = i % 2 === 1;
                return (
                  <div
                    key={p.id}
                    className={`rounded-md px-5 py-4 transition ${
                      isAccent ? "bg-[#ef4444] text-white" : "bg-gray-100 text-[#0c2651]"
                    }`}
                  >
                    <div className="font-semibold text-base md:text-lg">
                      {p.presenter ? `${p.presenter} - ${p.program_name}` : p.program_name}
                    </div>
                    <div className={`text-sm mt-0.5 ${isAccent ? "text-white/90" : "text-gray-600"}`}>
                      {fmt(p.start_time)} - {fmt(p.end_time)}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
