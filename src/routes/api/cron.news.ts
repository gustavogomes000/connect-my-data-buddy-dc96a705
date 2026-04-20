import { createFileRoute } from "@tanstack/react-router";
import { runAutoNewsIngest } from "@/lib/news-auto";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Cron-Secret",
};

export const Route = createFileRoute("/api/cron/news")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});

async function handle(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json(
      { error: "CRON_SECRET não configurado no servidor" },
      { status: 500, headers: CORS },
    );
  }
  const url = new URL(request.url);
  const provided =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("secret");
  if (provided !== expected) {
    return Response.json({ error: "Não autorizado" }, { status: 401, headers: CORS });
  }
  try {
    const result = await runAutoNewsIngest();
    return Response.json({ ok: true, ...result }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro";
    return Response.json({ ok: false, error: msg }, { status: 500, headers: CORS });
  }
}
