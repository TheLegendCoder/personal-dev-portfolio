import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/projects', () => ({
  getProjects: vi.fn(),
}));

vi.mock('@/components/projects/projectcards', () => ({
  ProjectCard: ({ id, title, isExperiment, featured }: { id: string; title: string; isExperiment?: boolean; featured?: boolean }) => (
    <article
      data-testid="project-card"
      data-slug={id}
      data-experiment={isExperiment ? 'true' : 'false'}
      data-featured={featured ? 'true' : 'false'}
    >
      <h3>{title}</h3>
    </article>
  ),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <section data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  ),
}));

vi.mock('@/components/ui/breadcrumb', () => ({
  BreadcrumbWithSchema: ({ items }: { items: Array<{ name: string }> }) => (
    <nav data-testid="breadcrumbs">{items.map((i) => i.name).join(' > ')}</nav>
  ),
}));

vi.mock('@/lib/seo/breadcrumbs', () => ({
  generateBreadcrumbs: vi.fn(() => [{ name: 'Home' }, { name: 'Projects' }]),
}));

vi.mock('lucide-react', () => ({
  Code2: () => <svg data-testid="code2" />,
}));

import ProjectsPage from '@/app/projects/page';
import { getProjects } from '@/lib/projects';
import type { PortfolioProject } from '@/lib/projects';

function project(
  overrides: Partial<PortfolioProject> & Pick<PortfolioProject, 'id'>,
): PortfolioProject {
  return {
    title: `Title ${overrides.id}`,
    description: 'A project',
    image: 'https://images.test/cover.png',
    image_hint: 'cover',
    tags: ['Next.js'],
    live_url: '',
    github_url: '',
    featured: false,
    published: true,
    category: 'personal',
    is_experiment: false,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    slug: `slug-${overrides.id}`,
    related_post_slugs: [],
    related_tutorial_slugs: [],
    related_project_slugs: [],
    ...overrides,
  } as PortfolioProject;
}

const render = (projects: PortfolioProject[]) => {
  vi.mocked(getProjects).mockResolvedValue(projects);
  return ProjectsPage().then(renderToStaticMarkup);
};

/** Index of a section heading, or -1 when the section isn't rendered. */
const sectionIndex = (html: string, name: string) => html.indexOf(`>${name}<`);

describe('projects page grouping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('puts a featured non-experiment under Featured', async () => {
    const html = await render([project({ id: 'a', featured: true })]);

    expect(sectionIndex(html, 'Featured')).toBeGreaterThan(-1);
    expect(sectionIndex(html, 'Side Projects')).toBe(-1);
    expect(sectionIndex(html, 'Experiments')).toBe(-1);
  });

  it('puts an unfeatured non-experiment under Side Projects', async () => {
    const html = await render([project({ id: 'b', featured: false })]);

    expect(sectionIndex(html, 'Side Projects')).toBeGreaterThan(-1);
    expect(sectionIndex(html, 'Featured')).toBe(-1);
  });

  it('puts a featured experiment under Experiments, not Featured', async () => {
    const html = await render([project({ id: 'c', featured: true, is_experiment: true })]);

    expect(sectionIndex(html, 'Experiments')).toBeGreaterThan(-1);
    expect(sectionIndex(html, 'Featured')).toBe(-1);
    // Exactly one card — the experiment must not be duplicated into another bucket.
    expect(html.match(/data-testid="project-card"/g)).toHaveLength(1);
  });

  it('keeps experiments out of Side Projects regardless of category', async () => {
    const html = await render([
      project({ id: 'd', is_experiment: true, category: 'professional' }),
    ]);

    expect(sectionIndex(html, 'Experiments')).toBeGreaterThan(-1);
    expect(sectionIndex(html, 'Side Projects')).toBe(-1);
  });

  it('renders all three sections in order when each bucket has a project', async () => {
    const html = await render([
      project({ id: 'feat', featured: true }),
      project({ id: 'side' }),
      project({ id: 'exp', is_experiment: true }),
    ]);

    const featured = sectionIndex(html, 'Featured');
    const side = sectionIndex(html, 'Side Projects');
    const experiments = sectionIndex(html, 'Experiments');

    expect(featured).toBeGreaterThan(-1);
    expect(featured).toBeLessThan(side);
    expect(side).toBeLessThan(experiments);
    expect(html.match(/data-testid="project-card"/g)).toHaveLength(3);
  });

  it('renders the empty state when there are no projects at all', async () => {
    const html = await render([]);

    expect(html).toContain('data-testid="empty-state"');
    expect(sectionIndex(html, 'Featured')).toBe(-1);
    expect(html).toContain('Home &gt; Projects');
  });

  it('passes is_experiment through to the card', async () => {
    const html = await render([project({ id: 'e', is_experiment: true })]);

    expect(html).toContain('data-experiment="true"');
  });
});
