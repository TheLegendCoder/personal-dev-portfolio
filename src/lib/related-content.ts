'use server';

import { getAllWriting } from '@/lib/writing';
import { getProjects } from '@/lib/projects';
import type { WritingItem } from '@/lib/writing-utils';

/**
 * Resolves the project ↔ article ↔ tutorial relationships added in migration
 * 0003 into renderable links.
 *
 * Relations are declared one-way in the CMS — an author records the link on
 * whichever row they happen to be editing — and resolved in both directions
 * here, so a project that names an article also shows up on that article.
 */

export interface RelatedLink {
  type: 'article' | 'tutorial' | 'project';
  title: string;
  description: string;
  href: string;
}

export interface RelatedContent {
  articles: RelatedLink[];
  tutorials: RelatedLink[];
  projects: RelatedLink[];
}

const EMPTY: RelatedContent = { articles: [], tutorials: [], projects: [] };

function writingLink(item: WritingItem): RelatedLink {
  return {
    type: item.type,
    title: item.title,
    description: item.description,
    href: item.href,
  };
}

/** Identifies the piece we are resolving relations *for*. */
export interface RelatedContentSubject {
  kind: 'article' | 'tutorial' | 'project';
  slug: string;
  /** Slugs this row itself declares. */
  relatedPostSlugs?: string[];
  relatedTutorialSlugs?: string[];
  relatedProjectSlugs?: string[];
}

export async function getRelatedContent(
  subject: RelatedContentSubject
): Promise<RelatedContent> {
  try {
    const [writing, projects] = await Promise.all([getAllWriting(), getProjects()]);

    const outgoingPosts = new Set(subject.relatedPostSlugs ?? []);
    const outgoingTutorials = new Set(subject.relatedTutorialSlugs ?? []);
    const outgoingProjects = new Set(subject.relatedProjectSlugs ?? []);

    // Reverse direction: rows that name this subject.
    const namesSubject = (row: {
      relatedPostSlugs?: string[] | null;
      relatedTutorialSlugs?: string[] | null;
      relatedProjectSlugs?: string[] | null;
    }) => {
      const list =
        subject.kind === 'article'
          ? row.relatedPostSlugs
          : subject.kind === 'tutorial'
            ? row.relatedTutorialSlugs
            : row.relatedProjectSlugs;
      return (list ?? []).includes(subject.slug);
    };

    const isSelf = (kind: string, slug: string) =>
      kind === subject.kind && slug === subject.slug;

    const articles: RelatedLink[] = [];
    const tutorials: RelatedLink[] = [];

    writing.forEach((item) => {
      if (isSelf(item.type, item.slug)) return;
      const outgoing =
        item.type === 'article'
          ? outgoingPosts.has(item.slug)
          : outgoingTutorials.has(item.slug);
      if (!outgoing && !namesSubject(item)) return;
      (item.type === 'article' ? articles : tutorials).push(writingLink(item));
    });

    const relatedProjects: RelatedLink[] = projects
      .filter((project) => {
        if (isSelf('project', project.slug)) return false;
        const row = {
          relatedPostSlugs: project.related_post_slugs,
          relatedTutorialSlugs: project.related_tutorial_slugs,
          relatedProjectSlugs: project.related_project_slugs,
        };
        return outgoingProjects.has(project.slug) || namesSubject(row);
      })
      .map((project) => ({
        type: 'project' as const,
        title: project.title,
        description: project.description,
        // The detail route accepts either key; the slug is the readable one.
        href: `/projects/${project.slug || project.id}`,
      }));

    return { articles, tutorials, projects: relatedProjects };
  } catch (error) {
    // Related content is an enhancement — never take a detail page down for it.
    console.error('[getRelatedContent] Failed to resolve relations:', error);
    return EMPTY;
  }
}
