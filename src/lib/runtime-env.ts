type RuntimeEnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_PUBLISHABLE_KEY"
  | "MY_SUPABASE_URL"
  | "MY_SUPABASE_SERVICE_ROLE_KEY"
  | "MY_SUPABASE_PUBLISHABLE_KEY"
  | "MY_ADMIN_SESSION_SECRET"
  | "ADMIN_SESSION_SECRET";

/**
 * Mapping from bare env key to the VITE_ prefixed version used in import.meta.env.
 * Vite only exposes variables prefixed with VITE_ to both client and SSR.
 */
const VITE_KEY_MAP: Partial<Record<RuntimeEnvKey, string>> = {
  SUPABASE_URL: "VITE_SUPABASE_URL",
  SUPABASE_SERVICE_ROLE_KEY: "VITE_SUPABASE_SERVICE_ROLE_KEY",
  SUPABASE_PUBLISHABLE_KEY: "VITE_SUPABASE_PUBLISHABLE_KEY",
  MY_SUPABASE_URL: "VITE_SUPABASE_URL",
  MY_SUPABASE_SERVICE_ROLE_KEY: "VITE_SUPABASE_SERVICE_ROLE_KEY",
  MY_SUPABASE_PUBLISHABLE_KEY: "VITE_SUPABASE_PUBLISHABLE_KEY",
  MY_ADMIN_SESSION_SECRET: "VITE_ADMIN_SESSION_SECRET",
  ADMIN_SESSION_SECRET: "VITE_ADMIN_SESSION_SECRET",
};

function nonEmpty(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function readRuntimeEnvValue(key: RuntimeEnvKey): string | undefined {
  // 1. process.env (Node.js / Cloudflare Workers with nodejs_compat)
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = nonEmpty(process.env[key]);
    if (fromProcess) return fromProcess;
  }

  // 2. import.meta.env (Vite – both client and SSR)
  try {
    const viteKey = VITE_KEY_MAP[key] ?? `VITE_${key}`;
    const meta = (import.meta as any).env;
    if (meta) {
      const fromVite = nonEmpty(meta[viteKey]) ?? nonEmpty(meta[key]);
      if (fromVite) return fromVite;
    }
  } catch {}

  // 3. globalThis fallbacks (Cloudflare Workers bindings)
  const g = globalThis as Record<string, unknown> & {
    env?: Record<string, unknown>;
    process?: { env?: Record<string, unknown> };
    __env__?: Record<string, unknown>;
  };

  const fromGlobal = g[key] ?? g.env?.[key] ?? g.__env__?.[key] ?? g.process?.env?.[key];
  return nonEmpty(fromGlobal);
}

export async function getRuntimeEnv(key: RuntimeEnvKey): Promise<string | undefined> {
  return readRuntimeEnvValue(key);
}

export async function resolveRuntimeEnv(...keys: RuntimeEnvKey[]): Promise<string | undefined> {
  for (const key of keys) {
    const value = readRuntimeEnvValue(key);
    if (value) return value;
  }
  return undefined;
}
