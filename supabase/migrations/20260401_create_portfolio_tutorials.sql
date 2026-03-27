-- ---------------------------------------------------------------------------
-- Create portfolio_tutorials table and define Row-Level Security policies.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS portfolio_tutorials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  description text NOT NULL,
  date        date NOT NULL,
  author      text NOT NULL,
  tags        text[] DEFAULT '{}',
  read_time   text NOT NULL,
  published   boolean DEFAULT false,
  featured    boolean DEFAULT false,
  image       text NOT NULL DEFAULT '',
  image_hint  text NOT NULL DEFAULT '',
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE portfolio_tutorials ENABLE ROW LEVEL SECURITY;

-- Public can read published tutorials
CREATE POLICY "Public can read published tutorials"
  ON portfolio_tutorials
  FOR SELECT
  USING (published = true);

-- Authenticated users have full CRUD access
CREATE POLICY "Authenticated users can manage tutorials"
  ON portfolio_tutorials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON TABLE public.portfolio_tutorials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.portfolio_tutorials TO authenticated;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_tutorials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE TRIGGER set_portfolio_tutorials_updated_at
BEFORE UPDATE ON portfolio_tutorials
FOR EACH ROW
EXECUTE FUNCTION update_portfolio_tutorials_updated_at();
