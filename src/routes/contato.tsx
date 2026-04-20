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
    handle: "@top100fm",
    href: "https://instagram.com/top100fm",
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
    handle: "@top100fm",
    href: "https://youtube.com/@top100fm",
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
        {/* CARD WHATSAPP — destaque principal */}
        <a
          href={WHATSAPP.href}
          target="_blank"
          rel="noopener"
          className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-[#25d366] via-[#1ebe5d] to-[#128c7e] p-[1.5px] shadow-[0_20px_50px_-20px_rgba(37,211,102,0.6)] hover:shadow-[0_25px_60px_-20px_rgba(37,211,102,0.8)] transition-all hover:-translate-y-1"
        >
          <div className="relative rounded-[calc(1.5rem-1.5px)] bg-gradient-to-br from-[#25d366] to-[#128c7e] p-7 md:p-10 overflow-hidden">
            {/* pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, white 1.5px, transparent 1.5px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative flex items-center gap-5 md:gap-7">
              <div className="flex-shrink-0 h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-white/80 mb-1">
                  Fale agora pelo WhatsApp
                </div>
                <div className="text-2xl md:text-4xl font-black text-white font-mono tabular-nums leading-tight">
                  {WHATSAPP.display}
                </div>
                <div className="mt-2 text-sm text-white/85">
                  Resposta rápida · 24h
                </div>
              </div>
              <ArrowUpRight className="hidden sm:block h-7 w-7 text-white/80 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </div>
        </a>

        {/* SECUNDÁRIOS — e-mail + endereço */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <a
            href={`mailto:${EMAIL}`}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#0a1f44]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#0a1f44] to-[#1a3a7a] flex items-center justify-center text-white">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  E-mail
                </div>
                <div className="mt-1 text-base md:text-lg font-bold text-[#0a1f44] truncate group-hover:text-[#c8102e] transition">
                  {EMAIL}
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[#c8102e] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </a>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#c8102e] to-[#a00d24] flex items-center justify-center text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Estúdio
                </div>
                <div className="mt-1 text-base md:text-lg font-bold text-[#0a1f44]">
                  {ENDERECO}
                </div>
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
