import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie, getCookie, useSession } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminSessionConfig } from "@/lib/admin-serverfn";

const ADMIN_COOKIE = "admin_session";
const ADMIN_PRESENCE_COOKIE = "admin_present";
const SESSION_DURATION = 60 * 60 * 24; // 24h
const SESSION_TOKEN_VALUE = "authenticated";
const IS_SECURE_COOKIE = process.env.NODE_ENV === "production";
export const ADMIN_SESSION_KEY = ADMIN_COOKIE;
export const ADMIN_PRESENCE_KEY = ADMIN_PRESENCE_COOKIE;
export const ADMIN_SESSION_TOKEN = SESSION_TOKEN_VALUE;

const SUPABASE_URL =
  (typeof process !== "undefined"
    ? process.env?.MY_SUPABASE_URL || process.env?.SUPABASE_URL
    : undefined) || import.meta.env.VITE_MY_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  (typeof process !== "undefined"
    ? process.env?.MY_SUPABASE_SERVICE_ROLE_KEY ||
      process.env?.SUPABASE_SERVICE_ROLE_KEY ||
      process.env?.MY_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.SUPABASE_PUBLISHABLE_KEY
    : undefined) ||
  import.meta.env.VITE_MY_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cliente único reutilizado entre invocações
const adminAuthClient =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    if (!adminAuthClient) {
      return { success: false, error: "Configuração do servidor incompleta" };
    }

    const { data: users, error } = await adminAuthClient.rpc("admin_check_password", {
      p_username: data.username,
      p_password: data.password,
    });

    if (error || !users || users.length === 0) {
      return { success: false, error: "Credenciais inválidas" };
    }

    const session = await useSession<{ authenticated: boolean }>(getAdminSessionConfig());
    await session.update({ authenticated: true });

    // Cookie "marcador" legível pelo cliente para o beforeLoad detectar sessão
    // sem precisar bater no servidor. O cookie real de auth segue httpOnly.
    setCookie(ADMIN_PRESENCE_COOKIE, "1", {
      httpOnly: false,
      secure: IS_SECURE_COOKIE,
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return { success: true, token: SESSION_TOKEN_VALUE };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<{ authenticated?: boolean }>(getAdminSessionConfig());
  await session.clear();
  deleteCookie(ADMIN_COOKIE);
  deleteCookie(ADMIN_PRESENCE_COOKIE);
  return { success: true };
});

export const checkAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<{ authenticated?: boolean }>(getAdminSessionConfig());
  const cookie = getCookie(ADMIN_PRESENCE_COOKIE);
  return { authenticated: session.data.authenticated === true || cookie === "1" };
});
