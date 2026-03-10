import { getFeaturedProjects } from '@/lib/projects';
import { FeaturedProjectsClient } from './featured-projects-client';

/**
 * Server component -- fetches featured projects from Supabase, then hands
 * them to the GSAP-animated client component.
 */
export async function FeaturedProjects() {
  const projects = await getFeaturedProjects();
  return <FeaturedProjectsClient projects={projects} />;
}
