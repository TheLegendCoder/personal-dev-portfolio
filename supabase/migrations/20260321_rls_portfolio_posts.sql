-- ---------------------------------------------------------------------------
-- Enable Row-Level Security on portfolio_posts and define access policies.
--
-- The portfolio_posts table stores blog content including unpublished drafts.
-- Without RLS the anon key can read all rows — including drafts — and may
-- allow unauthenticated writes depending on Supabase default grants.
--
-- This migration is idempotent — safe to run multiple times.
-- ---------------------------------------------------------------------------

-- 1. Ensure RLS is enabled
ALTER TABLE portfolio_posts ENABLE ROW LEVEL SECURITY;

-- 2. Public (anon) can only SELECT published posts
DROP POLICY IF EXISTS "Public can read published posts" ON portfolio_posts;

CREATE POLICY "Public can read published posts"
  ON portfolio_posts
  FOR SELECT
  USING (published = true);

-- 3. Authenticated users (admin) have full CRUD access
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON portfolio_posts;

CREATE POLICY "Authenticated users can manage posts"
  ON portfolio_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Table-level permissions (RLS is only evaluated after the role has table access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON TABLE public.portfolio_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.portfolio_posts TO authenticated;
