import type { SupabaseClient } from "@supabase/supabase-js";

// Helper que carrega o cliente Supabase admin (service role) apenas no servidor.
// O arquivo `client.server.ts` é bloqueado do bundle do cliente pelo plugin de
// import-protection do TanStack, garantindo que esta função nunca rode no browser.
let adminClientPromise: Promise<SupabaseClient> | null = null;

export async function getAdminSupabase(): Promise<SupabaseClient> {
  if (!adminClientPromise) {
    adminClientPromise = import("@/integrations/supabase/client.server").then(
      ({ getSupabaseAdmin }) => getSupabaseAdmin() as Promise<SupabaseClient>,
    );
  }
  return adminClientPromise;
}
