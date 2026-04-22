import { createServerOnlyFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";

let adminClientPromise: Promise<SupabaseClient> | null = null;

export const getAdminSupabase = createServerOnlyFn(async (): Promise<SupabaseClient> => {
  if (!adminClientPromise) {
    adminClientPromise = import("@/integrations/supabase/client.server").then(({ getSupabaseAdmin }) =>
      getSupabaseAdmin(),
    );
  }

  return adminClientPromise;
});