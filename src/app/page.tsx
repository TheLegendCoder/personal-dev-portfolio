import { Hero } from '@/components/home/hero';
import { FeaturedProjects } from '@/components/home/featuredprojects';
import { LatestPosts } from '@/components/home/latestposts';
import { ScrollCelebrationWrapper } from '@/components/home/scroll-celebration-wrapper';
import { generateSEOMetadata, getCanonicalUrl } from '@/lib/seo/metadata';
import { personalInfo } from '@/components/data/content';

// Cache home page for 1 hour, then regenerate on next request (Incremental Static Regeneration).
// Admin actions that update featured projects/blog posts call revalidatePath('/') to trigger immediate re-generation.
export const revalidate = 3600;

export const metadata = generateSEOMetadata({
  title: personalInfo.name,
  description: personalInfo.tagline + ' — ' + personalInfo.bio,
  canonicalUrl: getCanonicalUrl('/'),
});

export default function Home() {
  return (
    <ScrollCelebrationWrapper>
      <div className="flex flex-col items-center w-full overflow-x-hidden">
        <Hero />
        <FeaturedProjects />
        <LatestPosts />
      </div>
    </ScrollCelebrationWrapper>
  );
}

