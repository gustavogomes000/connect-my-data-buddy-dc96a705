import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeader, useSession } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { verifyAdminToken } from "@/lib/admin-token";

const ADMIN_COOKIE = "admin_session";
const ADMIN_HEADER = "x-admin-token";
const SESSION_DURATION = 60 * 60 * 24;

function getRuntimeEnv(key: "MY_ADMIN_SESSION_SECRET" | "ADMIN_SESSION_SECRET" | "MY_SUPABASE_SERVICE_ROLE_KEY" | "SUPABASE_SERVICE_ROLE_KEY") {
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

export function getAdminSecret() {
  return (
    getRuntimeEnv("MY_ADMIN_SESSION_SECRET") ||
    getRuntimeEnv("ADMIN_SESSION_SECRET") ||
    getRuntimeEnv("MY_SUPABASE_SERVICE_ROLE_KEY") ||
    getRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export function getAdminSessionConfig() {
  const isSecure = process.env.NODE_ENV === "production";
  const password = getAdminSecret();

  if (!password) {
    throw new Error("Configuração da sessão admin incompleta");
  }

  return {
    name: ADMIN_COOKIE,
    password,
    maxAge: SESSION_DURATION,
    cookie: {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export const adminClientTokenMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("admin_session") || localStorage.getItem("admin_session")
      : null;

  return next({
    headers: token
      ? {
          [ADMIN_HEADER]: token,
        }
      : undefined,
  });
});

const requireAdminMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await useSession<{ authenticated?: boolean }>(getAdminSessionConfig());
  const secret = getAdminSecret();
  const headerToken = getRequestHeader(ADMIN_HEADER);

  const hasValidHeader = secret ? await verifyAdminToken(headerToken, secret) : false;

  if (session.data.authenticated !== true && !hasValidHeader) {
    throw new Error("Não autorizado");
  }

  return next();
});

export function createAdminServerFn(method: "GET" | "POST") {
  return createServerFn({ method }).middleware([adminClientTokenMiddleware, requireAdminMiddleware]);
}
