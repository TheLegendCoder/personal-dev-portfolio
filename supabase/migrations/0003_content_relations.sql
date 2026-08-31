-- ---------------------------------------------------------------------------
-- 0003 — Cross-content relationships
--
-- Lets a project point at the article explaining why it was built and the
-- tutorial showing how, and vice versa. Stored as arrays of slugs rather than
-- a join table: the cardinality is tiny (a handful per row), the admin editor
-- is a simple multi-select, and slugs are what a human can actually type.
--
-- Relations are declared one-way and resolved in both directions in
-- application code (src/lib/related-content.ts), so an author only has to
-- record the link once.
--
-- Depends on 0002 for portfolio_projects.slug.
-- Idempotent: safe to re-run.
-- ---------------------------------------------------------------------------

alter table portfolio_posts
  add column if not exists related_post_slugs     text[] not null default '{}',
  add column if not exists related_tutorial_slugs text[] not null default '{}',
  add column if not exists related_project_slugs  text[] not null default '{}';

alter table portfolio_tutorials
  add column if not exists related_post_slugs     text[] not null default '{}',
  add column if not exists related_tutorial_slugs text[] not null default '{}',
  add column if not exists related_project_slugs  text[] not null default '{}';

alter table portfolio_projects
  add column if not exists related_post_slugs     text[] not null default '{}',
  add column if not exists related_tutorial_slugs text[] not null default '{}',
  add column if not exists related_project_slugs  text[] not null default '{}';
