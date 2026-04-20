// Server-side Supabase client with service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

type ServerEnvKey =
  | 'SUPABASE_URL'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'MY_SUPABASE_URL'
  | 'MY_SUPABASE_SERVICE_ROLE_KEY';

function getServerEnv(key: ServerEnvKey): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[key];
    if (typeof val === 'string' && val.length > 0) return val;
  }
  return undefined;
}

async function getServerEnvWithCF(key: ServerEnvKey): Promise<string | undefined> {
  // Try cloudflare:workers env (production Workers)
  try {
    const cfModule = await import(/* @vite-ignore */ 'cloudflare:workers');
    const val = (cfModule as any).env?.[key];
    if (typeof val === 'string' && val.length > 0) return val;
  } catch {
    // Not in Cloudflare Workers environment
  }

  return getServerEnv(key);
}

type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

async function createSupabaseAdminClientAsync(): Promise<SupabaseAdminClient> {
  const SUPABASE_URL =
    (await getServerEnvWithCF('MY_SUPABASE_URL')) || (await getServerEnvWithCF('SUPABASE_URL'));
  const SUPABASE_SERVICE_ROLE_KEY =
    (await getServerEnvWithCF('MY_SUPABASE_SERVICE_ROLE_KEY')) ||
    (await getServerEnvWithCF('SUPABASE_SERVICE_ROLE_KEY'));

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing Supabase server environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _clientPromise: Promise<SupabaseAdminClient> | null = null;

// Returns a promise that resolves to the admin Supabase client.
// Usage: const client = await getSupabaseAdmin();
export function getSupabaseAdmin(): Promise<SupabaseAdminClient> {
  if (!_clientPromise) {
    _clientPromise = createSupabaseAdminClientAsync();
  }
  return _clientPromise;
}

// Legacy export for backwards compatibility - creates sync client using process.env only
function createSupabaseAdminClientSync(): SupabaseAdminClient {
  const SUPABASE_URL = getServerEnv('MY_SUPABASE_URL') || getServerEnv('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY =
    getServerEnv('MY_SUPABASE_SERVICE_ROLE_KEY') || getServerEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing Supabase server environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

let _supabaseAdmin: SupabaseAdminClient | undefined;

// Proxy-based lazy sync client (uses process.env, works in dev and Workers with nodejs_compat)
export const supabaseAdmin = new Proxy({} as SupabaseAdminClient, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClientSync();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
