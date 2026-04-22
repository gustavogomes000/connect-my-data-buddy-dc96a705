import { createMiddleware, createServerFn } from "@tanstack/react-start";

const adminClientTokenMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("admin_session") || localStorage.getItem("admin_session")
        : null;

    return next({
      headers: token
        ? {
            "x-admin-token": token,
          }
        : undefined,
    });
  })
  .server(async ({ next, request }) => {
    const header = request.headers.get("x-admin-token");
    const cookieHeader = request.headers.get("cookie") || "";
    const hasCookie = /(?:^|;\s*)admin_session=authenticated(?:;|$)/.test(cookieHeader);

    if (!hasCookie && header !== "authenticated") {
      throw new Error("Não autorizado");
    }

    return next();
  });

export function createAdminServerFn(method: "GET" | "POST") {
  return createServerFn({ method }).middleware([adminClientTokenMiddleware]);
}
