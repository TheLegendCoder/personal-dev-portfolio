import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/require-auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/projects', () => ({
  upsertProject: vi.fn(),
  updateProjectFields: vi.fn(),
  deleteProject: vi.fn(),
}));

import {
  deleteProjectAction,
  saveProjectAction,
  toggleFeaturedAction,
  togglePublishedAction,
} from '@/app/admin/projects/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/require-auth';
import { deleteProject, updateProjectFields, upsertProject } from '@/lib/projects';

const sampleProject = {
  title: 'Portfolio CMS',
  description: 'An admin-enabled portfolio project.',
  image: 'https://images.test/project.png',
  image_hint: 'dashboard preview',
  tags: ['Next.js', 'Supabase'],
  live_url: 'https://portfolio.test/projects/cms',
  github_url: 'https://github.com/example/portfolio-cms',
  featured: true,
  published: true,
  category: 'professional' as const,
  sort_order: 1,
};

function expectCommonProjectRevalidations() {
  expect(revalidatePath).toHaveBeenCalledWith('/projects');
  expect(revalidatePath).toHaveBeenCalledWith('/admin/projects');
  expect(revalidatePath).toHaveBeenCalledWith('/');
}

describe('admin project actions integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue(undefined);
  });

  it('saveProjectAction saves, revalidates, and redirects', async () => {
    vi.mocked(upsertProject).mockResolvedValue({ success: true });

    await saveProjectAction(sampleProject);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(upsertProject).toHaveBeenCalledWith(sampleProject);
    expectCommonProjectRevalidations();
    expect(redirect).toHaveBeenCalledWith('/admin/projects');
  });

  it('togglePublishedAction updates and revalidates', async () => {
    vi.mocked(updateProjectFields).mockResolvedValue({ success: true });

    await togglePublishedAction('project-1', false);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(updateProjectFields).toHaveBeenCalledWith('project-1', {
      published: false,
    });
    expectCommonProjectRevalidations();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('toggleFeaturedAction updates and revalidates', async () => {
    vi.mocked(updateProjectFields).mockResolvedValue({ success: true });

    await toggleFeaturedAction('project-1', true);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(updateProjectFields).toHaveBeenCalledWith('project-1', {
      featured: true,
    });
    expectCommonProjectRevalidations();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('deleteProjectAction deletes, revalidates, and redirects', async () => {
    vi.mocked(deleteProject).mockResolvedValue({ success: true });

    await deleteProjectAction('project-1');

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(deleteProject).toHaveBeenCalledWith('project-1');
    expectCommonProjectRevalidations();
    expect(redirect).toHaveBeenCalledWith('/admin/projects');
  });

  it('throws when saveProjectAction persistence fails', async () => {
    vi.mocked(upsertProject).mockResolvedValue({
      success: false,
      error: 'project insert failed',
    });

    await expect(saveProjectAction(sampleProject)).rejects.toThrow('project insert failed');
  });

  it('throws when togglePublishedAction update fails', async () => {
    vi.mocked(updateProjectFields).mockResolvedValue({
      success: false,
      error: 'project update failed',
    });

    await expect(togglePublishedAction('project-1', true)).rejects.toThrow(
      'project update failed'
    );
  });

  it('throws when deleteProjectAction persistence fails', async () => {
    vi.mocked(deleteProject).mockResolvedValue({
      success: false,
      error: 'project delete failed',
    });

    await expect(deleteProjectAction('project-1')).rejects.toThrow('project delete failed');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('rejects actions when the auth guard fails', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    await expect(deleteProjectAction('project-1')).rejects.toThrow('Unauthorized');
    expect(deleteProject).not.toHaveBeenCalled();
  });
});