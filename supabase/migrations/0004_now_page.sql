-- ---------------------------------------------------------------------------
-- 0004 — /now page moves into the CMS
--
-- The /now page (intro paragraph + the Building/Learning/Exploring/Writing
-- sections + a "last updated" date) used to live in src/content/now.md and only
-- changed on a redeploy. This table makes it editable from /admin/now like the
-- other content types.
--
-- It is a singleton: exactly one row, id = 1, always public (no `published`
-- flag). `updated_at` doubles as the "Last updated" value shown on the page and
-- is stamped to "now" by the admin save action on every edit.
--
-- sections is jsonb: [{ "heading": text, "items": [text, ...] }, ...].
--
-- Idempotent: safe to re-run.
-- ---------------------------------------------------------------------------

create table if not exists portfolio_now (
  id         integer     primary key default 1 check (id = 1),
  body       text        not null default '',
  sections   jsonb       not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table portfolio_now enable row level security;

drop policy if exists "Public can read now" on portfolio_now;
create policy "Public can read now" on portfolio_now
  for select to public using (true);

drop policy if exists "Authenticated users can manage now" on portfolio_now;
create policy "Authenticated users can manage now" on portfolio_now
  for all to authenticated using (true) with check (true);

-- Seed the single row from the content that shipped in src/content/now.md.
insert into portfolio_now (id, body, sections, updated_at)
values (
  1,
  'This is a [now page](https://nownownow.com/about) — a snapshot of what has my
attention at the moment, rather than a résumé of everything I have ever done.
It changes as my focus does.',
  '[
    {
      "heading": "Building",
      "items": [
        "This site — reworking its information architecture around About, Work, Writing, Now and Contact.",
        "Backend services in C# and .NET, with a focus on keeping them observable and boring to operate."
      ]
    },
    {
      "heading": "Learning",
      "items": [
        "Distributed systems fundamentals — consistency, idempotency, and what actually happens under partial failure.",
        "Cloud infrastructure patterns, and where the abstractions leak."
      ]
    },
    {
      "heading": "Exploring",
      "items": [
        "How AI tooling changes the day-to-day shape of engineering work.",
        "Testing strategies that survive a refactor instead of blocking one."
      ]
    },
    {
      "heading": "Writing",
      "items": [
        "Notes on architecture decisions and the trade-offs behind them.",
        "Step-by-step guides for the problems that cost me the most time."
      ]
    }
  ]'::jsonb,
  '2026-08-25'
)
on conflict (id) do nothing;
