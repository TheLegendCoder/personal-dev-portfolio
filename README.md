# Personal Portfolio

Personal portfolio website built with Next.js 15+, TypeScript, Tailwind CSS, and Radix UI components. Features a comprehensive blog system with MDX support, project showcase, and advanced SEO implementation.

## Tech Stack

- **Framework**: Next.js 15+ with App Router & Turbopack
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + CVA (class-variance-authority)
- **UI Components**: Radix UI primitives + custom components
- **Content**: MDX for blogs with grey-matter frontmatter
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Markdown Processing**: Remark + Rehype with syntax highlighting
- **Animations**: Canvas confetti for celebration effects, custom CSS animations
- **Utilities**: 
  - `date-fns` for date formatting
  - `embla-carousel-react` for responsive carousel components
  - `recharts` for data visualisation and charts
  - `@tailwindcss/typography` for prose/markdown styling
- **SDK**: Firebase SDK installed (not actively deployed)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TheLegendCoder/personal-dev-portfolio.git
cd personal-dev-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your site URL:
```env
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:9003](http://localhost:9003) in your browser.

## Development Commands

```bash
npm run dev              # Start Next.js dev server on port 9003 with Turbopack
npm run build            # Production build
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint
```

## SEO Implementation

This website includes a comprehensive SEO infrastructure:

### ✅ Implemented Features

- **Sitemap**: Auto-generated XML sitemap at `/sitemap.xml` with all pages and blog posts
- **Robots.txt**: Crawl directives at `/robots.txt` with sitemap reference
- **Metadata**: Complete metadata on all pages (title, description, OpenGraph, Twitter Cards)
- **Structured Data**: JSON-LD schemas for Organisation, Website, Person, BlogPosting, and Breadcrumbs
- **Canonical URLs**: Proper canonical URL tags on all pages
- **Breadcrumb Navigation**: Visual breadcrumbs with schema markup
- **Image Optimisation**: Next.js Image component with Supabase support

### Environment Setup

The site URL is configured via an environment variable:

```env
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

For local development, you can use:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:9003
```

### Next Steps for SEO

1. **Content Optimization**: 
   - Optimise meta descriptions with target keywords
   - Add alt text to images
   - Improve internal linking structure

2. **Google Search Console**:
   - Verify site ownership at [Google Search Console](https://search.google.com/search-console)
   - Submit sitemap: `https://yoursite.com/sitemap.xml`
   - Monitor indexing status and search performance
   - **Note**: Wait until content is fully optimised before submitting

3. **Google Analytics** (Optional):
   - Set up GA4 property
   - Add measurement ID to `.env.local`:
     ```env
     NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
     ```
   - Implement tracking script in `app/layout.tsx`

4. **Testing & Validation**:
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema Markup Validator](https://validator.schema.org/)
   - [PageSpeed Insights](https://pagespeed.web.dev/)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with SEO schemas
│   ├── page.tsx           # Homepage
│   ├── blog/              # Blog pages with metadata
│   ├── projects/          # Projects showcase
│   ├── about/             # About page
│   ├── sitemap.ts         # Auto-generated sitemap
│   └── robots.ts          # Robots.txt configuration
├── components/
│   ├── ui/                # Reusable UI components (Radix-based)
│   ├── blog/              # Blog-specific components
│   ├── home/              # Homepage sections
│   ├── layout/            # Layout components (Navbar, Footer)
│   └── data/              # Content data (content.ts)
├── content/
│   └── blog/              # MDX/Markdown blog posts
├── lib/
│   ├── blog.ts            # Blog post loading logic
│   ├── markdown.ts        # Markdown processing
│   ├── utils.ts           # Utility functions
│   └── seo/               # SEO utilities
│       ├── metadata.ts    # Metadata generation helpers
│       ├── structured-data.ts  # JSON-LD schema generators
│       └── breadcrumbs.ts # Breadcrumb utilities
├── hooks/                 # Custom React hooks
└── contexts/              # React contexts

```

## Adding Content

### New Blog Post

Create a new file in `src/content/blog/` with frontmatter:

```markdown
---
title: Your Post Title
description: Brief summary of the post
date: 2026-02-05
author: Name LastName
tags: [React, TypeScript, Web Development]
readTime: 5 min read
published: true
featured: false
image: https://example.com/image.jpg
imageHint: Description of the image
---

# Your content here
```

The blog system automatically picks up new posts and adds them to the sitemap.

### Updating Portfolio Content

Edit `src/components/data/content.ts`:
- `personalInfo`: Name, title, bio, contact, social links
- `projects`: Array of project objects
- `aboutContent`: About page content

## Deployment

This site is configured for Firebase hosting:
### Build
```bash
npm run build
```

### Hosting Options

**Firebase App Hosting** (configured but not currently deployed):
- `apphosting.yaml` is configured for Firebase App Hosting
- Firebase SDK is installed for future deployment
- To deploy to Firebase when ready:
  ```bash
  firebase deploy
  ```

**Other Hosting**:
- The static build output in `.next/` is compatible with any Node.js hosting platform
- Can be deployed to Vercel, Netlify, AWS, Azure, or other services
## License

Personal portfolio - all rights reserved.

## Contact

- **GitHub**: [@TheLegendCoder](https://github.com/TheLegendCoder)
- **LinkedIn**: [Tsholofelo Ndawonde](https://www.linkedin.com/in/ndawonde/)
- **Twitter**: [@tsholofelo_dev](https://x.com/tsholo_dev)
- **Website**: [tsholofelondawonde.co.za](https://tsholofelondawonde.co.za)

