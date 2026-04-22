import { createMiddleware, createServerFn } from "@tanstack/react-start";

const adminClientTokenMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
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
});

export function createAdminServerFn(method: "GET" | "POST") {
  return createServerFn({ method }).middleware([adminClientTokenMiddleware]);
}
