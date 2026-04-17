import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | TOP100 FM" },
      { name: "description", content: "Fale com a Rádio TOP100 FM. WhatsApp, telefone, e-mail e endereço do estúdio." },
      { property: "og:title", content: "Contato | TOP100 FM" },
      { property: "og:description", content: "Fale com a Rádio TOP100 FM." },
    ],
  }),
  component: ContatoPage,
});

const CONTACTS = [
  { icon: "💬", title: "WhatsApp", value: "(00) 00000-0000", href: "https://wa.me/5500000000000" },
  { icon: "📞", title: "Telefone", value: "(00) 0000-0000", href: "tel:+550000000000" },
  { icon: "✉️", title: "E-mail", value: "contato@top100fm.com.br", href: "mailto:contato@top100fm.com.br" },
  { icon: "📍", title: "Endereço do Estúdio", value: "Rua Exemplo, 123 — Cidade/UF" },
];

function ContatoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-black text-[#0c2651] mb-2">Fale com a TOP100 FM</h1>
        <p className="text-base text-muted-foreground mb-8">
          Estamos no ar para você. Use o canal que preferir abaixo.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACTS.map((c) => {
            const inner = (
              <div className="h-full rounded-xl border bg-card p-6 transition hover:shadow-md hover:-translate-y-0.5">
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  {c.title}
                </div>
                <div className="mt-1 text-lg font-semibold text-[#0c2651]">{c.value}</div>
              </div>
            );
            return c.href ? (
              <a
                key={c.title}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener"
                className="block"
              >
                {inner}
              </a>
            ) : (
              <div key={c.title}>{inner}</div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
