import { useState } from "react";
import { submitPromotionEntry } from "@/lib/public-api";
import { LgpdTermsModal } from "@/components/LgpdTermsModal";

const maskCpf = (v: string) => v.replace(/\D/g, "").slice(0, 11)
  .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => v.replace(/\D/g, "").slice(0, 11)
  .replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");

export function PromotionEntryForm({ promotionId, onClose, onSuccess }: { promotionId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ full_name: "", whatsapp: "", cpf: "", instagram: "", facebook: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!acceptedLgpd) {
      setErr("Você precisa aceitar o termo de tratamento de dados (LGPD) para continuar.");
      return;
    }

    setLoading(true);
    try {
      await submitPromotionEntry({ data: { promotion_id: promotionId, ...form } });
      onSuccess();
    } catch (e: any) {
      setErr(e?.message || "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
          <button className="popup-close" onClick={onClose}>✕</button>
          <div className="popup-body">
            <h2 style={{ marginTop: 0 }}>Participar da promoção</h2>
            <p style={{ color: "#555", marginTop: -4 }}>Preencha todos os campos para concorrer.</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input required placeholder="Nome completo *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="entry-input" />
              <input required placeholder="WhatsApp * (com DDD)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })} className="entry-input" />
              <input required placeholder="CPF *" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCpf(e.target.value) })} className="entry-input" />
              <input required placeholder="@usuário do Instagram *" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="entry-input" />
              <input required placeholder="Facebook (link ou nome) *" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="entry-input" />

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 12,
                  color: "#555",
                  lineHeight: 1.45,
                  marginTop: 4,
                }}
              >
                <input
                  type="checkbox"
                  checked={acceptedLgpd}
                  onChange={(e) => setAcceptedLgpd(e.target.checked)}
                  style={{ marginTop: 3 }}
                  required
                />
                <span>
                  Li e aceito o tratamento dos meus dados pessoais conforme a LGPD.{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#0a1f44",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ler termos
                  </button>
                </span>
              </label>

              {err && <div style={{ color: "#c0392b", fontSize: 14 }}>{err}</div>}
              <button
                type="submit"
                disabled={loading || !acceptedLgpd}
                className="popup-link"
                style={{
                  border: "none",
                  cursor: loading || !acceptedLgpd ? "not-allowed" : "pointer",
                  opacity: loading || !acceptedLgpd ? 0.6 : 1,
                }}
              >
                {loading ? "Enviando..." : "Confirmar inscrição"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showTerms && <LgpdTermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}
