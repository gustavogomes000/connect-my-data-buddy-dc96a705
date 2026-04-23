import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie, getCookie, getRequestHeader, useSession } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { adminClientTokenMiddleware, getAdminSecret, getAdminSessionConfig } from "@/lib/admin-serverfn";
import { createAdminToken, verifyAdminToken } from "@/lib/admin-token";
import { getRuntimeEnv } from "@/lib/runtime-env";

const ADMIN_COOKIE = "admin_session";
const ADMIN_PRESENCE_COOKIE = "admin_present";
const SESSION_DURATION = 60 * 60 * 24;
const SESSION_TOKEN_VALUE = "authenticated";
const IS_SECURE_COOKIE = process.env.NODE_ENV === "production";
export const ADMIN_SESSION_KEY = ADMIN_COOKIE;
export const ADMIN_PRESENCE_KEY = ADMIN_PRESENCE_COOKIE;
export const ADMIN_SESSION_TOKEN = SESSION_TOKEN_VALUE;

async function getAdminAuthClient() {
  const supabaseUrl =
    (await getRuntimeEnv("MY_SUPABASE_URL")) ||
    (await getRuntimeEnv("SUPABASE_URL")) ||
    import.meta.env.VITE_MY_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey =
    (await getRuntimeEnv("MY_SUPABASE_SERVICE_ROLE_KEY")) ||
    (await getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY")) ||
    import.meta.env.VITE_MY_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const adminAuthClient = await getAdminAuthClient();
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

    const session = await useSession<{ authenticated: boolean }>(await getAdminSessionConfig());
    await session.update({ authenticated: true });
    const secret = (await getAdminSessionConfig()).password;
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
  const session = await useSession<{ authenticated?: boolean }>(await getAdminSessionConfig());
  await session.clear();
  deleteCookie(ADMIN_COOKIE);
  deleteCookie(ADMIN_PRESENCE_COOKIE);
  return { success: true };
});

export const checkAdminSession = createServerFn({ method: "GET" })
  .middleware([adminClientTokenMiddleware])
  .handler(async () => {
    const session = await useSession<{ authenticated?: boolean }>(await getAdminSessionConfig());
    const cookie = getCookie(ADMIN_PRESENCE_COOKIE);
    const secret = await getAdminSecret();
    const headerToken = getRequestHeader("x-admin-token");
    const hasValidHeader = secret ? await verifyAdminToken(headerToken, secret) : false;

    return { authenticated: session.data.authenticated === true || cookie === "1" || hasValidHeader };
  });
