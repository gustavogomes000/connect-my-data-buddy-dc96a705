import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLogout, checkAdminSession } from "@/lib/admin-auth";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { EntriesManager } from "@/components/admin/EntriesManager";
import { NewsManager } from "@/components/admin/NewsManager";
import { ProgramacaoManager } from "@/components/admin/ProgramacaoManager";
import { PodcastsManager } from "@/components/admin/PodcastsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SiteSettingsProvider } from "@/lib/site-settings-context";
import { SiteSettingsPage } from "./-site-settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Rota protegida – valida a sessão no servidor antes de renderizar.
export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const session = await checkAdminSession();
    if (!session?.authenticated) {
      throw redirect({ to: "/admin/login", replace: true });
    }
    return {};
  },
  head: () => ({
    meta: [{ title: "Painel · TOP100 FM" }],
  }),
  component: WrappedAdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>("settings");

  // Caso a sessão expire enquanto o usuário está no painel, redireciona.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <section className="admin-section">
            <div className="admin-form-card">
              <h1>Validando sessão...</h1>
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
        {tab === "settings" && <SiteSettingsPage />}
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

function WrappedAdminDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteSettingsProvider>
          <AdminDashboard />
        </SiteSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
