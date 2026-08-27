// ---------------------------------------------------------------------------
// Supabase Database types for the portfolio_posts table
//
// These mirror the live schema of project `hfazxdhdnozlgnxfowpy`, including the
// columns added by the `content_taxonomy`, `project_slugs` and
// `content_relations` migrations. Row types describe what a SELECT returns —
// every column below is NOT NULL in the database, so none of them are optional
// on read.
// ---------------------------------------------------------------------------

/** Columns the database always generates — never sent in an insert payload. */
type Generated = 'id' | 'created_at' | 'updated_at';

/**
 * Columns that have a database default: required when reading a row, optional
 * when writing one. Without this, every insert payload in the app would have to
 * spell out taxonomy and relation columns it has no opinion about.
 */
type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Taxonomy + cross-linking columns shared by posts and tutorials. */
type ContentDefaults =
  | 'topics'
  | 'evergreen'
  | 'related_post_slugs'
  | 'related_tutorial_slugs'
  | 'related_project_slugs';

export interface PortfolioPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  read_time: string;
  published: boolean;
  featured: boolean;
  image: string;
  image_hint: string;
  content: string; // raw markdown
  created_at: string;
  updated_at: string;
  topics: string[];
  evergreen: boolean;
  related_post_slugs: string[];
  related_tutorial_slugs: string[];
  related_project_slugs: string[];
}

export type DbBlogPostInsert = WithDefaults<Omit<PortfolioPost, Generated>, ContentDefaults>;
export type DbBlogPostUpdate = Partial<DbBlogPostInsert>;

// ---------------------------------------------------------------------------
// portfolio_projects table
// ---------------------------------------------------------------------------

export type ProjectCategory = 'professional' | 'personal';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  image: string;
  image_hint: string;
  tags: string[];
  live_url: string;
  github_url: string;
  featured: boolean;
  published: boolean;
  category: ProjectCategory;
  /** Groups the project under Experiments on /projects. Independent of category. */
  is_experiment: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** NOT NULL with no database default — an insert must supply it. */
  slug: string;
  related_post_slugs: string[];
  related_tutorial_slugs: string[];
  related_project_slugs: string[];
}

/**
 * `slug` is deliberately required: the column is NOT NULL with no database
 * default, so leaving it optional here would let an insert typecheck and then
 * fail at runtime.
 */
export type DbProjectInsert = WithDefaults<
  Omit<PortfolioProject, Generated>,
  'related_post_slugs' | 'related_tutorial_slugs' | 'related_project_slugs'
>;
export type DbProjectUpdate = Partial<DbProjectInsert>;

// ---------------------------------------------------------------------------
// portfolio_tutorials table
// ---------------------------------------------------------------------------

export interface PortfolioTutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  read_time: string;
  published: boolean;
  featured: boolean;
  image: string;
  image_hint: string;
  content: string; // raw markdown
  created_at: string;
  updated_at: string;
  topics: string[];
  evergreen: boolean;
  related_post_slugs: string[];
  related_tutorial_slugs: string[];
  related_project_slugs: string[];
}

export type DbTutorialInsert = WithDefaults<Omit<PortfolioTutorial, Generated>, ContentDefaults>;
export type DbTutorialUpdate = Partial<DbTutorialInsert>;

// Supabase requires a specific nested structure for the Database generic.
// Views/Functions/Enums must be present even if empty.
export type Database = {
  public: {
    Tables: {
      portfolio_posts: {
        Row: PortfolioPost;
        Insert: DbBlogPostInsert;
        Update: DbBlogPostUpdate;
        Relationships: [];
      };
      portfolio_projects: {
        Row: PortfolioProject;
        Insert: DbProjectInsert;
        Update: DbProjectUpdate;
        Relationships: [];
      };
      portfolio_tutorials: {
        Row: PortfolioTutorial;
        Insert: DbTutorialInsert;
        Update: DbTutorialUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

