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

-- Seed topics from tags that are ALREADY an exact canonical topic.
--
-- Deliberately not `set topics = tags`. `topics` is the curated canonical
-- subset, and the admin TopicPicker re-emits it as TOPICS.filter(...) on save —
-- so any free-form tag copied in here ("Building in Public", "CIDIS Model")
-- would be silently dropped the first time an author saved that post.
--
-- Aliases are NOT resolved here on purpose. `dotnet`, `Clean Architecture`,
-- `JWT` and the rest are already mapped at read time by normalizeTopics() in
-- src/lib/taxonomy.ts, so duplicating that alias table in SQL would just give
-- it a second place to drift. Nothing is lost by leaving them out.
--
-- The ordinal keeps the stored array in the same order as the TOPICS constant,
-- matching what the app writes back on save.
--
-- Shape note: the query drives off the constant VALUES list and correlates to
-- the row's tags inside an EXISTS. Iterating `unnest(tags)` in the FROM clause
-- instead would put an outer-query reference inside a derived table, which
-- Postgres rejects without LATERAL. Driving off the constant list also
-- de-duplicates for free — each canonical topic appears exactly once.
--
-- Only touches rows still at the default, so re-running will not clobber
-- curation done after the first run.
update portfolio_posts
set topics = coalesce((
  select array_agg(c.canonical order by c.ord)
  from (values ('C#', 1), ('.NET', 2), ('Architecture', 3), ('AI', 4),
               ('Cloud', 5), ('Security', 6), ('Testing', 7)) as c(canonical, ord)
  where exists (
    select 1 from unnest(portfolio_posts.tags) as tag
    where lower(tag) = lower(c.canonical)
  )
), '{}'::text[])
where topics = '{}' and tags is not null;

update portfolio_tutorials
set topics = coalesce((
  select array_agg(c.canonical order by c.ord)
  from (values ('C#', 1), ('.NET', 2), ('Architecture', 3), ('AI', 4),
               ('Cloud', 5), ('Security', 6), ('Testing', 7)) as c(canonical, ord)
  where exists (
    select 1 from unnest(portfolio_tutorials.tags) as tag
    where lower(tag) = lower(c.canonical)
  )
), '{}'::text[])
where topics = '{}' and tags is not null;

-- Topic pages filter on containment; GIN makes that an index scan.
create index if not exists portfolio_posts_topics_idx
  on portfolio_posts using gin (topics);
create index if not exists portfolio_tutorials_topics_idx
  on portfolio_tutorials using gin (topics);
