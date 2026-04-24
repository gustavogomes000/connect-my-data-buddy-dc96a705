import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/debug-env")({
  server: {
    handlers: {
      GET: async () => {
        const meta = (import.meta as any)?.env || {};
        const data = {
          processEnvKeys: typeof process !== "undefined" && process.env ? Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("ADMIN")) : [],
          processEnvSupabaseUrl: typeof process !== "undefined" ? !!process.env?.SUPABASE_URL : false,
          processEnvMySupabaseUrl: typeof process !== "undefined" ? !!process.env?.MY_SUPABASE_URL : false,
          importMetaKeys: Object.keys(meta).filter((k) => k.includes("SUPABASE") || k.includes("ADMIN") || k.includes("VITE")),
          importMetaViteSupabaseUrl: !!meta.VITE_SUPABASE_URL,
          importMetaSupabaseUrl: !!meta.SUPABASE_URL,
        };
        return new Response(JSON.stringify(data, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
