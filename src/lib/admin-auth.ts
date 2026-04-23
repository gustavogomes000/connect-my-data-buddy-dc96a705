import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie, getCookie, getRequestHeader, useSession } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";
import { adminClientTokenMiddleware, getAdminSecret, getAdminSessionConfig } from "@/lib/admin-serverfn";
import { createAdminToken, verifyAdminToken } from "@/lib/admin-token";

const ADMIN_COOKIE = "admin_session";
const ADMIN_PRESENCE_COOKIE = "admin_present";
const SESSION_DURATION = 60 * 60 * 24;
const SESSION_TOKEN_VALUE = "authenticated";
const IS_SECURE_COOKIE = process.env.NODE_ENV === "production";
export const ADMIN_SESSION_KEY = ADMIN_COOKIE;
export const ADMIN_PRESENCE_KEY = ADMIN_PRESENCE_COOKIE;
export const ADMIN_SESSION_TOKEN = SESSION_TOKEN_VALUE;

function getRuntimeEnv(key: "MY_SUPABASE_URL" | "SUPABASE_URL" | "MY_SUPABASE_SERVICE_ROLE_KEY" | "SUPABASE_SERVICE_ROLE_KEY") {
  const fromWorker = env?.[key];
  if (typeof fromWorker === "string" && fromWorker.length > 0) return fromWorker;
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env[key];
    if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  }
  const g = globalThis as Record<string, unknown> & { env?: Record<string, unknown> };
  const fromGlobal = g[key] ?? g.env?.[key];
  return typeof fromGlobal === "string" && fromGlobal.length > 0 ? fromGlobal : undefined;
}

function getAdminAuthClient() {
  const supabaseUrl = getRuntimeEnv("MY_SUPABASE_URL") || getRuntimeEnv("SUPABASE_URL") || import.meta.env.VITE_MY_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = getRuntimeEnv("MY_SUPABASE_SERVICE_ROLE_KEY") || getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY") || import.meta.env.VITE_MY_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const adminAuthClient = getAdminAuthClient();
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
    const secret = getAdminSessionConfig().password;
    const token = await createAdminToken(
      {
        username: data.username,
        expiresAt: Date.now() + SESSION_DURATION * 1000,
      },
      secret,
    );

    // Cookie "marcador" legível pelo cliente para o beforeLoad detectar sessão
    // sem precisar bater no servidor. O cookie real de auth segue httpOnly.
    setCookie(ADMIN_PRESENCE_COOKIE, "1", {
      httpOnly: false,
      secure: IS_SECURE_COOKIE,
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return { success: true, token };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<{ authenticated?: boolean }>(getAdminSessionConfig());
  await session.clear();
  deleteCookie(ADMIN_COOKIE);
  deleteCookie(ADMIN_PRESENCE_COOKIE);
  return { success: true };
});

export const checkAdminSession = createServerFn({ method: "GET" })
  .middleware([adminClientTokenMiddleware])
  .handler(async () => {
    const session = await useSession<{ authenticated?: boolean }>(getAdminSessionConfig());
    const cookie = getCookie(ADMIN_PRESENCE_COOKIE);
    const secret = getAdminSecret();
    const headerToken = getRequestHeader("x-admin-token");
    const hasValidHeader = secret ? await verifyAdminToken(headerToken, secret) : false;

    return { authenticated: session.data.authenticated === true || cookie === "1" || hasValidHeader };
  });
