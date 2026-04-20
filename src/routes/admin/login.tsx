import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { adminLogin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Entrar — Painel TOP100 FM" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
      setError("Preencha usuário e senha.");
      return;
    }

    setLoading(true);
    try {
      const result = await adminLogin({ data: { username, password } });
      if (result.success) {
        window.location.href = "/admin";
      } else {
        setError(result.error || "Não foi possível entrar.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">100</div>
          <h1>Entrar no Painel</h1>
          <p>Rádio TOP100 FM · Administração</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          {error && <div className="admin-error">{error}</div>}
          <div className="admin-field">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Seu usuário"
              autoComplete="username"
              autoFocus
              defaultValue=""
            />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              defaultValue=""
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <div className="admin-login-hint">Acesso restrito à equipe TOP100 FM</div>
      </div>
    </div>
  );
}
