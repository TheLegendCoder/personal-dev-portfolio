-- ---------------------------------------------------------------------------
-- Grant the anon role permission to read portfolio_projects.
-- RLS policies alone are not enough — PostgreSQL also requires explicit table-level
-- GRANT before RLS is even evaluated for a role.
-- Without this, the anon client receives "permission denied for table portfolio_projects"
-- and the frontend silently falls back to static data instead of reading from the DB.
-- This file is idempotent — safe to run multiple times.
-- ---------------------------------------------------------------------------

-- Allow the anon role to access the public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Allow the anon role to SELECT rows from portfolio_projects
-- (RLS policy "Public can read published projects" still gates which rows are visible)
GRANT SELECT ON TABLE public.portfolio_projects TO anon;

-- Also grant to authenticated so the session client used in Server Components works too
GRANT SELECT ON TABLE public.portfolio_projects TO authenticated;
