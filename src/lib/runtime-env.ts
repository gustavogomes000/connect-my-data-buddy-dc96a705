type RuntimeEnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_PUBLISHABLE_KEY"
  | "MY_SUPABASE_URL"
  | "MY_SUPABASE_SERVICE_ROLE_KEY"
  | "MY_SUPABASE_PUBLISHABLE_KEY"
  | "MY_ADMIN_SESSION_SECRET"
  | "ADMIN_SESSION_SECRET";

function readRuntimeEnvValue(key: RuntimeEnvKey): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env[key];
    if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  }

  const g = globalThis as Record<string, unknown> & {
    env?: Record<string, unknown>;
    process?: { env?: Record<string, unknown> };
    __env__?: Record<string, unknown>;
  };

  const fromGlobal = g[key] ?? g.env?.[key] ?? g.__env__?.[key] ?? g.process?.env?.[key];
  return typeof fromGlobal === "string" && fromGlobal.length > 0 ? fromGlobal : undefined;
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
