import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  adminLogout,
  checkAdminSession,
  ADMIN_SESSION_KEY,
  ADMIN_SESSION_TOKEN,
} from "@/lib/admin-auth";
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

function hasAdminToken() {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_SESSION_TOKEN ||
      localStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_SESSION_TOKEN
    );
  } catch {
    return false;
  }
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("promos");
  const [authed, setAuthed] = useState<boolean>(() => hasAdminToken());
  const [status, setStatus] = useState<"checking" | "ready" | "blocked">("checking");

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      try {
        const res = await checkAdminSession();
        if (cancelled) return;

        if (res?.authenticated) {
          setAuthed(true);
          setStatus("ready");
          return;
        }
      } catch {}

      try {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        localStorage.removeItem(ADMIN_SESSION_KEY);
      } catch {}

      if (!cancelled) {
        setAuthed(false);
        setStatus("blocked");
        navigate({ to: "/admin/login", replace: true });
      }
    };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const logout = async () => {
    try {
      await adminLogout();
    } catch {}
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
    setAuthed(false);
    setStatus("blocked");
    navigate({ to: "/admin/login", replace: true });
  };

  if (status === "checking") {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <section className="admin-section">
            <div className="admin-form-card">
              <h1>Abrindo painel...</h1>
              <p className="admin-hint">Validando seu acesso com segurança.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!authed) return null;

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
