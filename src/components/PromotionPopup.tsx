import { useState, useEffect } from "react";
import { getActivePromotions } from "@/lib/public-api";
import { PromotionEntryForm } from "@/components/PromotionEntryForm";

type Promotion = {
  id: string; title: string; description: string | null; image_url: string | null;
  link: string | null; popup_duration_seconds: number; show_as_popup: boolean;
};

export function PromotionPopup() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [visible, setVisible] = useState(false);
  const [participating, setParticipating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("promo_dismissed");
    if (dismissed) return;

    getActivePromotions().then((data) => {
      const popups = (data as Promotion[]).filter((p) => p.show_as_popup);
      if (popups.length > 0) {
        setPromo(popups[0]);
        setTimeout(() => setVisible(true), 2000);
      }
    });
  }, []);

  useEffect(() => {
    if (promo && visible && !participating) {
      const timer = setTimeout(() => {
        handleClose();
      }, promo.popup_duration_seconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [promo, visible, participating]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("promo_dismissed", "true");
  };

  if (!promo || !visible) return null;

  if (participating) {
    return (
      <PromotionEntryForm
        promotionId={promo.id}
        onClose={() => setParticipating(false)}
        onSuccess={() => {
          setParticipating(false);
          setSuccess(true);
        }}
      />
    );
  }

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={handleClose}>✕</button>
        {promo.image_url && <img src={promo.image_url} alt={promo.title} className="popup-img" />}
        <div className="popup-body">
          <h2>{promo.title}</h2>
          {promo.description && <p>{promo.description}</p>}
          {success ? (
            <div style={{ color: "#16a34a", fontWeight: 700, marginTop: 10 }}>
              ✅ Inscrição confirmada! Boa sorte!
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              <button
                onClick={() => setParticipating(true)}
                className="popup-link"
                style={{ border: "none", cursor: "pointer" }}
              >
                🎁 Participar agora
              </button>
              {promo.link && (
                <a href={promo.link} target="_blank" rel="noopener noreferrer" className="popup-link">
                  Saiba mais →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
