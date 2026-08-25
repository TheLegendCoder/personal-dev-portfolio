-- ---------------------------------------------------------------------------
-- 0001 — Content taxonomy
--
-- Adds explicit topic and evergreen metadata to the two writing tables.
--
-- Design note: `type` is NOT stored. An item's type is which table it came
-- from (portfolio_posts = article, portfolio_tutorials = tutorial), so a
-- column would be duplicated state that can drift.
--
-- `status` is likewise derived rather than stored:
--   featured  -> the existing `featured` column
--   evergreen -> the `evergreen` column added here
--   latest    -> the existing `date` column
-- A `status text[]` column would encode all three a second time.
--
-- `topics` is separate from `tags` on purpose. `tags` stays free-form (it is
-- what authors have been typing for months, and it still drives keywords and
-- card labels); `topics` is the curated subset that maps onto the canonical
-- list in src/lib/taxonomy.ts and gets its own navigable page.
--
-- Idempotent: safe to re-run.
-- ---------------------------------------------------------------------------

alter table portfolio_posts     add column if not exists topics    text[] not null default '{}';
alter table portfolio_posts     add column if not exists evergreen boolean not null default false;

alter table portfolio_tutorials add column if not exists topics    text[] not null default '{}';
alter table portfolio_tutorials add column if not exists evergreen boolean not null default false;

-- Seed topics from the tags that already exist, so nothing starts empty.
-- Only touches rows still at the default, so re-running will not clobber
-- curation done after the first run.
update portfolio_posts     set topics = tags where topics = '{}' and tags is not null;
update portfolio_tutorials set topics = tags where topics = '{}' and tags is not null;

-- Topic pages filter on containment; GIN makes that an index scan.
create index if not exists portfolio_posts_topics_idx
  on portfolio_posts using gin (topics);
create index if not exists portfolio_tutorials_topics_idx
  on portfolio_tutorials using gin (topics);
