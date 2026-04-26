type RuntimeEnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_PUBLISHABLE_KEY"
  | "MY_SUPABASE_URL"
  | "MY_SUPABASE_SERVICE_ROLE_KEY"
  | "MY_SUPABASE_PUBLISHABLE_KEY"
  | "MY_ADMIN_SESSION_SECRET"
  | "ADMIN_SESSION_SECRET";

function readFromRecord(source: unknown, key: RuntimeEnvKey): string | undefined {
  const value = (source as Record<string, unknown> | undefined)?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function readRuntimeEnvValue(key: RuntimeEnvKey): Promise<string | undefined> {
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = readFromRecord(process.env, key);
    if (fromProcess) return fromProcess;
  }

  const g = globalThis as Record<string, unknown> & {
    env?: Record<string, unknown>;
    process?: { env?: Record<string, unknown> };
    __env__?: Record<string, unknown>;
  };

  const fromGlobal =
    readFromRecord(g, key) || readFromRecord(g.env, key) || readFromRecord(g.__env__, key) || readFromRecord(g.process?.env, key);
  if (fromGlobal) return fromGlobal;

  if (typeof window === "undefined") {
    try {
      const importWorkerEnv = new Function("return import('cloudflare:workers')") as () => Promise<{ env?: Record<string, unknown> }>;
      const workers = await importWorkerEnv();
      const fromWorkerEnv = readFromRecord(workers.env, key);
      if (fromWorkerEnv) return fromWorkerEnv;
    } catch {
      /* ignore */
    }
  }

  try {
    const meta = (import.meta as any)?.env as Record<string, unknown> | undefined;
    const fromMeta = readFromRecord(meta, key) || readFromRecord(meta, `VITE_${key}` as RuntimeEnvKey);
    if (fromMeta) return fromMeta;
  } catch {
    /* ignore */
  }

  return undefined;
}

export async function getRuntimeEnv(key: RuntimeEnvKey): Promise<string | undefined> {
  return readRuntimeEnvValue(key);
}

export async function resolveRuntimeEnv(...keys: RuntimeEnvKey[]): Promise<string | undefined> {
  for (const key of keys) {
    const value = await readRuntimeEnvValue(key);
    if (value) return value;
  }
  return undefined;
}
