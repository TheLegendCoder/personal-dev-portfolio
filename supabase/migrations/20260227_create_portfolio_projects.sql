-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text NOT NULL,
  image       text NOT NULL DEFAULT '',
  image_hint  text NOT NULL DEFAULT '',
  tags        text[] NOT NULL DEFAULT '{}',
  live_url    text NOT NULL DEFAULT '',
  github_url  text NOT NULL DEFAULT '',
  featured    boolean NOT NULL DEFAULT false,
  published   boolean NOT NULL DEFAULT false,
  category    text NOT NULL DEFAULT 'professional'
                CHECK (category IN ('professional', 'personal')),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row-Level Security
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Public (anon) can only read published projects
CREATE POLICY "Public can read published projects"
  ON portfolio_projects FOR SELECT
  USING (published = true);

-- Authenticated users (admin) have full access
CREATE POLICY "Authenticated users can manage projects"
  ON portfolio_projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed existing projects
INSERT INTO portfolio_projects (title, description, image, image_hint, tags, live_url, github_url, featured, published, category, sort_order)
VALUES
  (
    'Portfolio Website',
    'My personal portfolio site to showcase my skills and projects. Designed with attention to detail and built with Next.js, TypeScript, and Tailwind CSS for a modern, responsive experience.',
    'https://djfeucuujeenuvappydk.supabase.co/storage/v1/object/public/public-images/personal-website/snapshot.png',
    'personal website',
    ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX'],
    '#',
    'https://github.com/TheLegendCoder/tsholofelo-ndawonde',
    true,
    true,
    'professional',
    1
  ),
  (
    'Writeonce',
    'Help creators turn long-form content into platform-optimized versions for target specific channels. A content transformation tool that enables creators to repurpose their work across multiple platforms efficiently.',
    'https://djfeucuujeenuvappydk.supabase.co/storage/v1/object/public/public-images/personal-website/writeone.png',
    'writeonce content platform',
    ARRAY['Next.js', 'Supabase', 'Tailwind CSS'],
    'https://www.writeonce.co/',
    '',
    true,
    true,
    'professional',
    2
  );
