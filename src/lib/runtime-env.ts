type RuntimeEnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_PUBLISHABLE_KEY"
  | "MY_SUPABASE_URL"
  | "MY_SUPABASE_SERVICE_ROLE_KEY"
  | "MY_SUPABASE_PUBLISHABLE_KEY"
  | "MY_ADMIN_SESSION_SECRET"
  | "ADMIN_SESSION_SECRET";

let cachedWorkerEnv: Record<string, string | undefined> | null | undefined;

async function getWorkerEnv() {
  if (cachedWorkerEnv !== undefined) return cachedWorkerEnv;
  try {
    const modName = "cloudflare:workers";
    const mod = (await import(/* @vite-ignore */ modName)) as { env?: Record<string, string | undefined> };
    cachedWorkerEnv = mod?.env ?? null;
  } catch {
    cachedWorkerEnv = null;
  }
  return cachedWorkerEnv;
}

export async function getRuntimeEnv(key: RuntimeEnvKey): Promise<string | undefined> {
  const workerEnv = await getWorkerEnv();
  const fromWorker = workerEnv?.[key];
  if (typeof fromWorker === "string" && fromWorker.length > 0) return fromWorker;

  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env[key];
    if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  }

  const g = globalThis as Record<string, unknown> & {
    env?: Record<string, unknown>;
    process?: { env?: Record<string, unknown> };
  };
  const fromGlobal = g[key] ?? g.env?.[key] ?? g.process?.env?.[key];
  return typeof fromGlobal === "string" && fromGlobal.length > 0 ? fromGlobal : undefined;
}

export async function resolveRuntimeEnv(...keys: RuntimeEnvKey[]): Promise<string | undefined> {
  for (const key of keys) {
    const value = await getRuntimeEnv(key);
    if (value) return value;
  }
  return undefined;
}
