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
  const [selected, setSelected] = useState<Promotion | null>(null);
  const [participating, setParticipating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getActivePromotions().then((data) => setPromos(data as Promotion[]));
  }, []);

  const openPromo = (p: Promotion) => {
    setSelected(p);
    setParticipating(false);
    setSuccess(false);
  };

  const closePromo = () => {
    setSelected(null);
    setParticipating(false);
    setSuccess(false);
  };

  return (
    <div style={{ width: "100%", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <SiteHeader />
      <div className="public-page">
        <h1 className="public-page-title">🎉 Promoções</h1>
        {promos.length === 0 && <p className="public-empty">Nenhuma promoção ativa no momento.</p>}
        <div className="promo-grid">
          {promos.map((p) => (
            <div key={p.id} className="promo-card">
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="promo-card-img"
                  style={{ cursor: "pointer" }}
                  onClick={() => openPromo(p)}
                />
              )}
              <div className="promo-card-body">
                <h3 style={{ cursor: "pointer" }} onClick={() => openPromo(p)}>{p.title}</h3>
                {p.description && <p>{p.description}</p>}
                <button className="promo-card-btn" onClick={() => openPromo(p)}>
                  🎁 Participar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && !participating && (
        <div className="popup-overlay" onClick={closePromo}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePromo} aria-label="Fechar">✕</button>
            {selected.image_url && (
              <div className="popup-img-wrap">
                <img src={selected.image_url} alt={selected.title} className="popup-img" />
                <span className="popup-badge">🎁 Promoção Top 100 FM</span>
              </div>
            )}
            <div className="popup-body">
              {!selected.image_url && <span className="popup-badge popup-badge-inline">🎁 Promoção Top 100 FM</span>}
              <h2>{selected.title}</h2>
              {selected.description && <p>{selected.description}</p>}
              {success && (
                <div className="popup-success">
                  <span className="popup-success-icon">✓</span>
                  <div>
                    <strong>Inscrição confirmada!</strong>
                    <span>Boa sorte 🍀</span>
                  </div>
                </div>
              )}
            </div>
            {!success && (
              <div className="popup-footer">
                <button onClick={() => setParticipating(true)} className="popup-btn-primary">
                  Participar agora
                  <span className="popup-btn-arrow">→</span>
                </button>
                {selected.link && (
                  <a href={selected.link} target="_blank" rel="noopener noreferrer" className="popup-btn-secondary">
                    Saiba mais
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {selected && participating && (
        <PromotionEntryForm
          promotionId={selected.id}
          onClose={() => setParticipating(false)}
          onSuccess={() => { setParticipating(false); setSuccess(true); }}
        />
      )}

      <SiteFooter />
    </div>
  );
}
