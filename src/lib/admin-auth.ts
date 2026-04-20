import { createServerFn } from "@tanstack/react-start";

const ADMIN_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 24; // 24h
const SESSION_TOKEN_VALUE = "authenticated";
export const ADMIN_SESSION_KEY = ADMIN_COOKIE;
export const ADMIN_SESSION_TOKEN = SESSION_TOKEN_VALUE;

const FALLBACK_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function readAdminEnv(key: string): Promise<string | undefined> {
  if (key === "VITE_SUPABASE_URL" && FALLBACK_SUPABASE_URL) return FALLBACK_SUPABASE_URL;
  if (key === "VITE_SUPABASE_PUBLISHABLE_KEY" && FALLBACK_SUPABASE_PUBLISHABLE_KEY) {
    return FALLBACK_SUPABASE_PUBLISHABLE_KEY;
  }
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key];
  try {
    const cf: any = await import(/* @vite-ignore */ "cloudflare:workers");
    const v = cf?.env?.[key];
    if (typeof v === "string" && v) return v;
  } catch {}
  return undefined;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { setCookie } = await import("@tanstack/react-start/server");
    const { createClient } = await import("@supabase/supabase-js");

    const url = (await readAdminEnv("SUPABASE_URL")) || (await readAdminEnv("VITE_SUPABASE_URL"));
    const key =
      (await readAdminEnv("SUPABASE_PUBLISHABLE_KEY")) ||
      (await readAdminEnv("VITE_SUPABASE_PUBLISHABLE_KEY"));

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

    return { success: true, token: SESSION_TOKEN_VALUE };
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
