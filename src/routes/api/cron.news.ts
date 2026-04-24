import { createFileRoute } from "@tanstack/react-router";
import { CRON_NEWS_CORS, handleCronNewsRequest } from "@/lib/cron-news";

export const Route = createFileRoute("/api/cron/news")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CRON_NEWS_CORS }),
      GET: async ({ request }) => handleCronNewsRequest(request),
      POST: async ({ request }) => handleCronNewsRequest(request),
    },
  },
});
