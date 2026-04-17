import { createServerFn } from "@tanstack/react-start";

const ADMIN_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 24; // 24h

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { setCookie } = await import("@tanstack/react-start/server");
    const { createClient } = await import("@supabase/supabase-js");

    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return { success: false, error: "Configuração do servidor incompleta" };
    }

    const supabase = createClient(url, key);

    const { data: users, error } = await supabase.rpc("admin_check_password", {
      p_username: data.username,
      p_password: data.password,
    });

    if (error || !users || users.length === 0) {
      return { success: false, error: "Credenciais inválidas" };
    }

    setCookie(ADMIN_COOKIE, "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return { success: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(ADMIN_COOKIE);
  return { success: true };
});

export const checkAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const cookie = getCookie(ADMIN_COOKIE);
  return { authenticated: cookie === "authenticated" };
});
