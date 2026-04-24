import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  MapPin,
  ArrowUpRight,
  Navigation,
} from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | TOP100 FM" },
      { name: "description", content: "Fale com a Rádio TOP100 FM pelo WhatsApp, e-mail, redes sociais ou visite nosso estúdio em Aparecida de Goiânia." },
      { property: "og:title", content: "Contato | TOP100 FM" },
      { property: "og:description", content: "WhatsApp, e-mail, redes sociais e endereço do estúdio TOP100 FM." },
    ],
  }),
  component: ContatoPage,
});

// ⚠️ AJUSTE AQUI quando tiver o número/email reais
const WHATSAPP = {
  display: "(62) 00000-0000",
  href: "https://wa.me/5562000000000?text=Ol%C3%A1%2C%20TOP100%20FM!",
};

const EMAIL = "contato@axisdigital.com.br";

const ENDERECO = {
  label: "Estúdio TOP 100",
  street: "R. Antártida — Conj. Planície",
  city: "Aparecida de Goiânia — GO",
  cep: "74988-716",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("R. Antártida, Conj. Planicie, Aparecida de Goiânia - GO, 74988-716"),
  embedUrl:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("R. Antártida, Conj. Planicie, Aparecida de Goiânia - GO, 74988-716") +
    "&output=embed",
};

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
  {
    name: "WhatsApp",
    handle: "Fale agora",
    href: WHATSAPP.href,
    Icon: MessageCircle,
    gradient: "from-[#25d366] to-[#128c7e]",
  },
  {
    name: "E-mail",
    handle: EMAIL,
    href: `mailto:${EMAIL}`,
    Icon: Mail,
    gradient: "from-[#0a1f44] to-[#1a3a7a]",
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
            Manda um oi, sugere uma música, participa do programa ou venha visitar nosso estúdio em Aparecida de Goiânia.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        {/* CANAIS DIRETOS */}
        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {/* WhatsApp (destaque) */}
          <a
            href={WHATSAPP.href}
            target="_blank"
            rel="noopener"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c7e] p-6 shadow-[0_12px_32px_-12px_rgba(37,211,102,0.55)] hover:shadow-[0_18px_40px_-12px_rgba(37,211,102,0.75)] hover:-translate-y-1 transition-all duration-300"
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
              <div className="text-xl md:text-2xl font-black text-white font-mono tabular-nums leading-tight">
                {WHATSAPP.display}
              </div>
              <div className="mt-1.5 text-xs text-white/85">
                Estúdio · sugestões · participação
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
              <div className="text-base md:text-lg font-black text-[#0a1f44] truncate group-hover:text-[#c8102e] transition leading-tight">
                {EMAIL}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                Imprensa, parcerias & comercial
              </div>
            </div>
          </a>
        </div>

        {/* ESTÚDIO + MAPA */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-[#c8102e] to-[#0a1f44]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8102e]">
                Visite a gente
              </p>
              <h2 className="text-xl md:text-2xl font-black text-[#0a1f44] tracking-tight leading-none mt-0.5">
                Nosso estúdio
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-5">
            {/* Card endereço */}
            <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#c8102e] to-[#a00d24] flex items-center justify-center text-white mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                {ENDERECO.label}
              </div>
              <div className="text-base md:text-lg font-black text-[#0a1f44] leading-snug">
                {ENDERECO.street}
              </div>
              <div className="text-sm text-[#0a1f44]/80 mt-0.5">{ENDERECO.city}</div>
              <div className="text-xs text-muted-foreground mt-0.5">CEP {ENDERECO.cep}</div>

              <a
                href={ENDERECO.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-auto pt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#0a1f44] px-4 py-2.5 text-xs md:text-sm font-bold text-white hover:bg-[#c8102e] hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <Navigation className="h-4 w-4" />
                Abrir no Google Maps
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Mapa */}
            <div className="md:col-span-3 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm min-h-[260px] md:min-h-0">
              <iframe
                title="Localização Estúdio TOP 100"
                src={ENDERECO.embedUrl}
                className="w-full h-full min-h-[260px] md:min-h-[340px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SOCIAIS.map(({ name, handle, href, Icon, gradient }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener"
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-transparent hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:bg-white/20 group-hover:backdrop-blur transition-all`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                  <div className="text-sm font-black text-[#0a1f44] group-hover:text-white transition-colors">
                    {name}
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:text-white/85 transition-colors mt-0.5 truncate">
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
