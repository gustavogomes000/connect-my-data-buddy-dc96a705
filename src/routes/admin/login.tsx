import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { adminLogin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Login - Painel Admin TOP100 FM" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminLogin({ data: { username, password } });
      if (result.success) {
        window.location.href = "/admin";
      } else {
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Erro ao conectar ao servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔒 Painel Admin</h1>
          <p>Rádio TOP100 FM</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-error">{error}</div>}
          <div className="admin-field">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
