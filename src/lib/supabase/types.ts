// ---------------------------------------------------------------------------
// Supabase Database types for the portfolio_posts table
// ---------------------------------------------------------------------------

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
  // Curated subset of `tags` mapping onto src/lib/taxonomy.ts (migration 0001).
  // `tags` stays free-form; only `topics` gets navigable pages.
  topics: string[];
  // Status is derived, never stored as a list: featured -> `featured`,
  // evergreen -> this column, latest -> `date`.
  evergreen: boolean;
  // Cross-content relationships (migration 0003). Slug arrays rather than a
  // join table: cardinality is tiny and slugs are what an author can type.
  related_post_slugs: string[];
  related_tutorial_slugs: string[];
  related_project_slugs: string[];
  created_at: string;
  updated_at: string;
}

// The Stage 2 columns all carry NOT NULL DEFAULTs in the migrations, so an
// insert may legitimately omit them and let Postgres fill them in.
type WritingDefaults = 'topics' | 'evergreen' | RelationColumns;
type RelationColumns =
  | 'related_post_slugs'
  | 'related_tutorial_slugs'
  | 'related_project_slugs';

export type DbBlogPostInsert = Omit<
  PortfolioPost,
  'id' | 'created_at' | 'updated_at' | WritingDefaults
> &
  Partial<Pick<PortfolioPost, WritingDefaults>>;
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
  sort_order: number;
  // Readable URL key backfilled from the title (migration 0002). /projects/[id]
  // resolves by slug first and falls back to the uuid, so old URLs still work.
  slug: string;
  // Cross-content relationships (migration 0003). Slug arrays rather than a
  // join table: cardinality is tiny and slugs are what an author can type.
  related_post_slugs: string[];
  related_tutorial_slugs: string[];
  related_project_slugs: string[];
  created_at: string;
  updated_at: string;
}

// `slug` is backfilled by migration 0002 and derived from the title in the
// admin action, so it is optional on insert too.
export type DbProjectInsert = Omit<
  PortfolioProject,
  'id' | 'created_at' | 'updated_at' | 'slug' | RelationColumns
> &
  Partial<Pick<PortfolioProject, 'slug' | RelationColumns>>;
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
  // Curated subset of `tags` mapping onto src/lib/taxonomy.ts (migration 0001).
  // `tags` stays free-form; only `topics` gets navigable pages.
  topics: string[];
  // Status is derived, never stored as a list: featured -> `featured`,
  // evergreen -> this column, latest -> `date`.
  evergreen: boolean;
  // Cross-content relationships (migration 0003). Slug arrays rather than a
  // join table: cardinality is tiny and slugs are what an author can type.
  related_post_slugs: string[];
  related_tutorial_slugs: string[];
  related_project_slugs: string[];
  created_at: string;
  updated_at: string;
}

export type DbTutorialInsert = Omit<
  PortfolioTutorial,
  'id' | 'created_at' | 'updated_at' | WritingDefaults
> &
  Partial<Pick<PortfolioTutorial, WritingDefaults>>;
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

