// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverKeys = [
    "MY_SUPABASE_URL",
    "MY_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "MY_ADMIN_SESSION_SECRET",
    "ADMIN_SESSION_SECRET",
  ];
  const define: Record<string, string> = {};
  for (const key of serverKeys) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
    if (env[key]) {
      define[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  }

  return { vite: { define } };
});
