import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useState, useEffect } from "react";
import { getActivePromotions } from "@/lib/public-api";
import { PromotionEntryForm } from "@/components/PromotionEntryForm";

export const Route = createFileRoute("/promocoes")({
  head: () => ({
    meta: [
      { title: "Promoções - Rádio TOP100 FM" },
      { name: "description", content: "Confira as promoções ativas da Rádio TOP100 FM!" },
    ],
  }),
  component: PromocoesPage,
});

type Promotion = {
  id: string; title: string; description: string | null; image_url: string | null;
  link: string | null; is_active: boolean; popup_duration_seconds: number;
};

function PromocoesPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [participatingId, setParticipatingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    getActivePromotions().then((data) => setPromos(data as Promotion[]));
  }, []);

  return (
    <div style={{ width: "100%", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <SiteHeader />
      <div className="public-page">
        <h1 className="public-page-title">🎉 Promoções</h1>
        {promos.length === 0 && <p className="public-empty">Nenhuma promoção ativa no momento.</p>}
        <div className="promo-grid">
          {promos.map((p) => (
            <div key={p.id} className="promo-card">
              {p.image_url && <img src={p.image_url} alt={p.title} className="promo-card-img" />}
              <div className="promo-card-body">
                <h3>{p.title}</h3>
                {p.description && <p>{p.description}</p>}
                {successId === p.id ? (
                  <div style={{ color: "#16a34a", fontWeight: 600, marginTop: 8 }}>✅ Inscrição confirmada! Boa sorte!</div>
                ) : (
                  <button className="promo-card-btn" onClick={() => setParticipatingId(p.id)}>
                    🎁 Participar
                  </button>
                )}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="promo-card-link" style={{ marginLeft: 10 }}>
                    Saiba mais →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {participatingId && (
        <PromotionEntryForm
          promotionId={participatingId}
          onClose={() => setParticipatingId(null)}
          onSuccess={() => { setSuccessId(participatingId); setParticipatingId(null); }}
        />
      )}
      <SiteFooter />
    </div>
  );
}
