import { useState } from "react";
import { submitPromotionEntry } from "@/lib/public-api";

const maskCpf = (v: string) => v.replace(/\D/g, "").slice(0, 11)
  .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => v.replace(/\D/g, "").slice(0, 11)
  .replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");

export function PromotionEntryForm({ promotionId, onClose, onSuccess }: { promotionId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ full_name: "", whatsapp: "", cpf: "", instagram: "", facebook: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
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
            {err && <div style={{ color: "#c0392b", fontSize: 14 }}>{err}</div>}
            <button type="submit" disabled={loading} className="popup-link" style={{ border: "none", cursor: "pointer" }}>
              {loading ? "Enviando..." : "Confirmar inscrição"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
