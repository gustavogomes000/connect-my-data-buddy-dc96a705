import { getCookie, getRequestHeader } from "@tanstack/react-start/server";

export async function requireAdmin() {
  const cookie = getCookie("admin_session");
  const header = getRequestHeader("x-admin-token");

  if (cookie !== "authenticated" && header !== "authenticated") {
    throw new Error("Não autorizado");
  }
}
