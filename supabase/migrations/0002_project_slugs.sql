-- ---------------------------------------------------------------------------
-- 0002 — Project slugs
--
-- portfolio_projects is keyed only by a uuid, so /projects/<id> serves opaque
-- URLs while blog and tutorials use readable slugs. That also makes the
-- relationship columns in 0003 unauthorable by hand — nobody types a uuid into
-- a related-content field.
--
-- Adds a slug backfilled from the title. /projects/[id] keeps working: the
-- route resolves by slug first, then falls back to id, so every existing URL
-- and every existing sitemap entry stays valid.
--
-- Idempotent: safe to re-run.
-- ---------------------------------------------------------------------------

alter table portfolio_projects add column if not exists slug text;

-- Slugify the title: lowercase, strip anything not alphanumeric/space/hyphen,
-- collapse whitespace runs to single hyphens, trim leading/trailing hyphens.
update portfolio_projects
set slug = trim(both '-' from
      regexp_replace(
        regexp_replace(lower(title), '[^a-z0-9\s-]', '', 'g'),
        '[\s-]+', '-', 'g'
      )
    )
where slug is null or slug = '';

-- Titles are not guaranteed unique. Disambiguate collisions by appending the
-- first 8 characters of the row's uuid, which is stable across re-runs.
with duplicates as (
  select id, slug,
         row_number() over (partition by slug order by created_at, id) as rn
  from portfolio_projects
  where slug is not null
)
update portfolio_projects p
set slug = p.slug || '-' || left(p.id::text, 8)
from duplicates d
where p.id = d.id and d.rn > 1;

-- A project with an empty title would slugify to ''. Fall back to the uuid.
update portfolio_projects
set slug = id::text
where slug is null or slug = '';

alter table portfolio_projects alter column slug set not null;

create unique index if not exists portfolio_projects_slug_key
  on portfolio_projects (slug);

-- Enforce the slug shape in the database, not only in the admin editor's zod
-- schema. The backfill above produces exactly this shape, so it cannot fail on
-- existing rows. `drop ... if exists` first because `add constraint` has no
-- `if not exists` — this keeps the file re-runnable.
alter table portfolio_projects
  drop constraint if exists portfolio_projects_slug_format;
alter table portfolio_projects
  add constraint portfolio_projects_slug_format
  check (slug ~ '^[a-z0-9-]+$');
