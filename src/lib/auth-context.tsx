import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { checkAdminSession, adminLogout } from "@/lib/admin-auth";
import { useNavigate } from "@tanstack/react-router";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    const session = await checkAdminSession();
    setIsAuthenticated(!!session?.authenticated);
    setIsLoading(false);
  };

  const logout = async () => {
    await adminLogout();
    try {
      // limpa storage que ainda pode existir (compatibilidade)
      sessionStorage.removeItem("admin_session");
      localStorage.removeItem("admin_session");
    } catch {}
    setIsAuthenticated(false);
    navigate({ to: "/admin/login", replace: true });
  };

  // on mount, verify session (covers page refresh)
  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
