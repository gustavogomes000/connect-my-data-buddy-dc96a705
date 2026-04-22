import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

const ADMIN_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 24;

function getAdminSessionConfig() {
  const password =
    process.env.MY_ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.MY_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!password) {
    throw new Error("Configuração da sessão admin incompleta");
  }

  return {
    name: ADMIN_COOKIE,
    password,
    maxAge: SESSION_DURATION,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

const requireAdminMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await useSession<{ authenticated?: boolean }>(getAdminSessionConfig());

  if (session.data.authenticated !== true) {
    throw new Error("Não autorizado");
  }

  return next();
});

export function createAdminServerFn(method: "GET" | "POST") {
  return createServerFn({ method }).middleware([requireAdminMiddleware]);
}
