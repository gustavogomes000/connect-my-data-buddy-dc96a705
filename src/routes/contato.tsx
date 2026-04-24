import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MessageCircle, Instagram, Facebook, Youtube, Mail, MapPin, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | TOP100 FM" },
      { name: "description", content: "Fale com a Rádio TOP100 FM pelo WhatsApp, e-mail e redes sociais." },
      { property: "og:title", content: "Contato | TOP100 FM" },
      { property: "og:description", content: "Fale com a Rádio TOP100 FM." },
    ],
  }),
  component: ContatoPage,
});

const WHATSAPP = {
  display: "(00) 00000-0000",
  href: "https://wa.me/5500000000000?text=Ol%C3%A1%2C%20TOP100%20FM!",
};

const EMAIL = "contato@top100fm.com.br";
const ENDERECO = "Rua Exemplo, 123 — Cidade/UF";

const SOCIAIS = [
  {
    name: "Instagram",
    handle: "@top100fmoficial",
    href: "https://www.instagram.com/top100fmoficial",
    Icon: Instagram,
    gradient: "from-[#feda75] via-[#d62976] to-[#4f5bd5]",
  },
  {
    name: "Facebook",
    handle: "/top100fm",
    href: "https://facebook.com/top100fm",
    Icon: Facebook,
    gradient: "from-[#1877f2] to-[#0a4cc7]",
  },
  {
    name: "YouTube",
    handle: "@top100fmoficial",
    href: "https://www.youtube.com/@top100fmoficial",
    Icon: Youtube,
    gradient: "from-[#ff0000] to-[#990000]",
  },
];

function ContatoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0a1f44] text-white">
        <div className="pointer-events-none absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full bg-[#c8102e]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-[#1a3a7a]/60 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3 py-1.5 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8102e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c8102e]" />
            </span>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-white/90">
              Estamos no ar
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.95]">
            Fale com a{" "}
            <span className="bg-gradient-to-r from-white via-white to-[#ff5470] bg-clip-text text-transparent">
              TOP100 FM
            </span>
          </h1>
          <p className="mt-4 text-white/70 max-w-xl text-sm md:text-base leading-relaxed">
            Manda um oi, sugere uma música, participa do programa ou só vem trocar ideia. A gente responde rapidinho.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        {/* CANAIS DIRETOS — grid uniforme */}
        <div className="grid gap-4 md:gap-5 md:grid-cols-3">
          {/* WhatsApp (destaque verde) */}
          <a
            href={WHATSAPP.href}
            target="_blank"
            rel="noopener"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c7e] p-6 shadow-[0_12px_32px_-12px_rgba(37,211,102,0.55)] hover:shadow-[0_18px_40px_-12px_rgba(37,211,102,0.75)] hover:-translate-y-1 transition-all duration-300 md:col-span-1"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, white 1.2px, transparent 1.2px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <ArrowUpRight className="h-5 w-5 text-white/80 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 mb-1.5">
                WhatsApp
              </div>
              <div className="text-lg md:text-xl font-black text-white font-mono tabular-nums leading-tight">
                {WHATSAPP.display}
              </div>
              <div className="mt-1.5 text-xs text-white/85">
                Resposta rápida
              </div>
            </div>
          </a>

          {/* E-mail */}
          <a
            href={`mailto:${EMAIL}`}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#0a1f44]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#0a1f44] to-[#1a3a7a] flex items-center justify-center text-white">
                <Mail className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-[#c8102e] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                E-mail
              </div>
              <div className="text-sm md:text-base font-black text-[#0a1f44] truncate group-hover:text-[#c8102e] transition leading-tight">
                {EMAIL}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                Para imprensa & parcerias
              </div>
            </div>
          </a>

          {/* Endereço */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#c8102e] to-[#a00d24] flex items-center justify-center text-white">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                Estúdio
              </div>
              <div className="text-sm md:text-base font-black text-[#0a1f44] leading-tight">
                {ENDERECO}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                Visite nosso estúdio
              </div>
            </div>
          </div>
        </div>

        {/* REDES SOCIAIS */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-[#c8102e] to-[#0a1f44]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8102e]">
                Siga & participe
              </p>
              <h2 className="text-xl md:text-2xl font-black text-[#0a1f44] tracking-tight leading-none mt-0.5">
                Nas redes sociais
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {SOCIAIS.map(({ name, handle, href, Icon, gradient }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener"
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-transparent hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* gradiente que aparece no hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:bg-white/20 group-hover:backdrop-blur transition-all`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                  <div className="text-base font-black text-[#0a1f44] group-hover:text-white transition-colors">
                    {name}
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-white/85 transition-colors mt-0.5">
                    {handle}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
