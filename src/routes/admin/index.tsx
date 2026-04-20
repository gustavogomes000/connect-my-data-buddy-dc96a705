import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { adminLogout, checkAdminSession } from "@/lib/admin-auth";
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
  beforeLoad: async () => {
    try {
      const r = await checkAdminSession();
      if (!r.authenticated) {
        throw redirect({ to: "/admin/login" });
      }
    } catch (e) {
      // Re-throw redirect, otherwise force redirect on error
      if (e && typeof e === "object" && "isRedirect" in e) throw e;
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("promos");

  const logout = async () => {
    try {
      await adminLogout();
    } catch {}
    window.location.href = "/admin/login";
  };

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
