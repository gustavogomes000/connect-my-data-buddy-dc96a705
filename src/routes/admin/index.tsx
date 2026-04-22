import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { adminLogout, checkAdminSession } from "@/lib/admin-auth";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { EntriesManager } from "@/components/admin/EntriesManager";
import { NewsManager } from "@/components/admin/NewsManager";
import { ProgramacaoManager } from "@/components/admin/ProgramacaoManager";
import { PodcastsManager } from "@/components/admin/PodcastsManager";
import { SponsorsManager } from "@/components/admin/SponsorsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { SiteSettingsProvider } from "@/lib/site-settings-context";
import { SiteSettingsPage } from "./-site-settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Rota protegida – valida a sessão no servidor antes de renderizar.
export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    // Verificação rápida via cookie "marcador" no cliente.
    // O cookie real de auth é httpOnly e validado server-side em cada chamada admin.
    if (typeof document !== "undefined") {
      const hasSession =
        document.cookie.split("; ").some((c) => c.startsWith("admin_present=")) ||
        (typeof localStorage !== "undefined" &&
          localStorage.getItem("admin_session") === "authenticated");
      if (!hasSession) {
        throw redirect({ to: "/admin/login", replace: true });
      }
    }
    return {};
  },
  head: () => ({
    meta: [{ title: "Painel · TOP100 FM" }],
  }),
  component: WrappedAdminDashboard,
});

function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("promos");

  const handleLogout = async () => {
    await adminLogout();
    window.location.replace("/admin/login");
  };

  return (
    <div className="admin-layout">
      <AdminSidebar tab={tab} onChange={setTab} onLogout={handleLogout} />
      <main className="admin-main">
        {tab === "settings" && <SiteSettingsPage />}
        {tab === "promos" && <PromotionsManager />}
        {tab === "entries" && <EntriesManager />}
        {tab === "news" && <NewsManager />}
        {tab === "programacao" && <ProgramacaoManager />}
        {tab === "podcasts" && <PodcastsManager />}
        {tab === "sponsors" && <SponsorsManager />}
        {tab === "users" && <UsersManager />}
      </main>
    </div>
  );
}

function WrappedAdminDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <AdminDashboard />
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}
