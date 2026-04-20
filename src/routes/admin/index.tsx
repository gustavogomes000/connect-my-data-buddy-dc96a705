import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogout, ADMIN_SESSION_KEY, ADMIN_SESSION_TOKEN } from "@/lib/admin-auth";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { EntriesManager } from "@/components/admin/EntriesManager";
import { NewsManager } from "@/components/admin/NewsManager";
import { ProgramacaoManager } from "@/components/admin/ProgramacaoManager";
import { PodcastsManager } from "@/components/admin/PodcastsManager";
import { UsersManager } from "@/components/admin/UsersManager";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Painel · TOP100 FM" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("promos");
  const [status, setStatus] = useState<"checking" | "ready" | "blocked">("checking");

  useEffect(() => {
    const has =
      (typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_SESSION_TOKEN) ||
      (typeof localStorage !== "undefined" &&
        localStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_SESSION_TOKEN);
    if (has) {
      setStatus("ready");
    } else {
      setStatus("blocked");
      window.location.href = "/admin/login";
    }
  }, [navigate]);

  const logout = async () => {
    try {
      await adminLogout();
    } catch {}
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
    window.location.href = "/admin/login";
  };

  if (status !== "ready") {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <section className="admin-section">
            <div className="admin-form-card">
              <h1>{status === "checking" ? "Abrindo painel..." : "Redirecionando..."}</h1>
              <p className="admin-hint">
                {status === "checking"
                  ? "Validando sua sessão para entrar no painel administrativo."
                  : "Sua sessão não foi encontrada."}
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar tab={tab} onChange={setTab} onLogout={logout} />
      <main className="admin-main">
        {tab === "promos" && <PromotionsManager />}
        {tab === "entries" && <EntriesManager />}
        {tab === "news" && <NewsManager />}
        {tab === "programacao" && <ProgramacaoManager />}
        {tab === "podcasts" && <PodcastsManager />}
        {tab === "users" && <UsersManager />}
      </main>
    </div>
  );
}
