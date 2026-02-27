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
  created_at: string;
  updated_at: string;
}

export type DbBlogPostInsert = Omit<PortfolioPost, 'id' | 'created_at' | 'updated_at'>;
export type DbBlogPostUpdate = Partial<DbBlogPostInsert>;

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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

