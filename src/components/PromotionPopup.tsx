import { useState, useEffect } from "react";
import { getActivePromotions } from "@/lib/public-api";
import { PromotionDetailsModal, type PromotionLike } from "@/components/PromotionDetailsModal";

type Promotion = PromotionLike & {
  popup_duration_seconds: number;
  show_as_popup: boolean;
};

export function PromotionPopup() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [visible, setVisible] = useState(false);

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

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("promo_dismissed", "true");
  };

  if (!promo || !visible) return null;

  return <PromotionDetailsModal promo={promo} onClose={handleClose} />;
}
