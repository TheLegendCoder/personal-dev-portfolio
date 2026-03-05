-- ---------------------------------------------------------------------------
-- Fix: ensure portfolio_projects has a public anon SELECT policy.
-- The original migration (20260227) may not have been applied to the live DB.
-- This file is idempotent — safe to run multiple times.
-- ---------------------------------------------------------------------------

-- 1. Make sure RLS is enabled (no-op if already on)
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing SELECT policy for the anon/public role and recreate it
--    so the frontend (anon client) can read published projects.
DROP POLICY IF EXISTS "Public can read published projects" ON portfolio_projects;

CREATE POLICY "Public can read published projects"
  ON portfolio_projects
  FOR SELECT
  USING (published = true);

-- 3. Ensure the authenticated admin policy also exists (idempotent)
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON portfolio_projects;

CREATE POLICY "Authenticated users can manage projects"
  ON portfolio_projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
