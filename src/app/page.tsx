import { Hero } from '@/components/home/hero';
import { WorkThemes } from '@/components/home/work-themes';
import { Currently } from '@/components/home/currently';
import { FeaturedProjects } from '@/components/home/featuredprojects';
import { LatestPosts } from '@/components/home/latestposts';
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import { personalInfo } from '@/components/data/content';

// Cache home page for 1 hour, then regenerate on next request (Incremental Static Regeneration).
// Admin actions that update featured projects/blog posts call revalidatePath('/') to trigger immediate re-generation.
export const revalidate = 3600;

export const metadata = generateSEOMetadata({
  description: `${personalInfo.tagline}. ${personalInfo.bio}`,
  canonicalUrl: getCanonicalUrl('/'),
});

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden">
      <Hero />
      <WorkThemes />
      <Currently />
      <FeaturedProjects />
      <LatestPosts />
    </div>
  );
}

