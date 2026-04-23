import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SQL = `
create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_url text not null,
  thumbnail_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.podcasts enable row level security;
drop policy if exists "podcasts_public_read" on public.podcasts;
create policy "podcasts_public_read" on public.podcasts for select using (is_active = true);
drop policy if exists "podcasts_admin_all" on public.podcasts;
create policy "podcasts_admin_all" on public.podcasts for all using (true) with check (true);
`;

export const Route = createFileRoute("/api/public/setup/podcasts")({
  server: {
    handlers: {
      GET: async () => {
        // Try via RPC if available
        const { error } = await supabaseAdmin.rpc("exec_sql" as any, { sql: SQL } as any);
        if (error) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: error.message,
              hint: "Run the SQL manually in Supabase SQL Editor",
              sql: SQL,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
