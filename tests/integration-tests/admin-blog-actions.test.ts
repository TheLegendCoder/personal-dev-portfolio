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

vi.mock('@/lib/blog', () => ({
  upsertBlogPost: vi.fn(),
  updateBlogPostFields: vi.fn(),
  deleteBlogPost: vi.fn(),
}));

import {
  deletePostAction,
  savePostAction,
  toggleFeaturedAction,
  togglePublishedAction,
} from '@/app/admin/blog/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/require-auth';
import { deleteBlogPost, updateBlogPostFields, upsertBlogPost } from '@/lib/blog';

function expectCommonBlogRevalidations(slug: string) {
  expect(revalidatePath).toHaveBeenCalledWith('/blog');
  expect(revalidatePath).toHaveBeenCalledWith(`/blog/${slug}`);
  expect(revalidatePath).toHaveBeenCalledWith('/admin/blog');
  expect(revalidatePath).toHaveBeenCalledWith('/');
}

describe('admin blog actions integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue(undefined);
  });

  it('savePostAction saves, revalidates all related paths, and redirects', async () => {
    vi.mocked(upsertBlogPost).mockResolvedValue({ success: true });

    await savePostAction({
      slug: 'my-new-post',
      title: 'My New Post',
      description: 'Description',
      date: '2026-05-01',
      author: 'Admin',
      tags: ['nextjs'],
      read_time: '5 min read',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      image_hint: 'laptop code editor',
      content: '# Hello',
      published: true,
      featured: false,
    });

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(upsertBlogPost).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'my-new-post', title: 'My New Post' })
    );
    expectCommonBlogRevalidations('my-new-post');
    expect(redirect).toHaveBeenCalledWith('/admin/blog');
  });

  it('togglePublishedAction updates, revalidates all related paths', async () => {
    vi.mocked(updateBlogPostFields).mockResolvedValue({ success: true });

    await togglePublishedAction('existing-post', true);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(updateBlogPostFields).toHaveBeenCalledWith('existing-post', {
      published: true,
    });
    expectCommonBlogRevalidations('existing-post');
  });

  it('toggleFeaturedAction updates, revalidates all related paths', async () => {
    vi.mocked(updateBlogPostFields).mockResolvedValue({ success: true });

    await toggleFeaturedAction('existing-post', true);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(updateBlogPostFields).toHaveBeenCalledWith('existing-post', {
      featured: true,
    });
    expectCommonBlogRevalidations('existing-post');
  });

  it('deletePostAction deletes, revalidates, and redirects', async () => {
    vi.mocked(deleteBlogPost).mockResolvedValue({ success: true });

    await deletePostAction('old-post');

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(deleteBlogPost).toHaveBeenCalledWith('old-post');
    expect(revalidatePath).toHaveBeenCalledWith('/blog');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/blog');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(redirect).toHaveBeenCalledWith('/admin/blog');
  });

  it('throws when savePostAction persistence fails', async () => {
    vi.mocked(upsertBlogPost).mockResolvedValue({
      success: false,
      error: 'insert failed',
    });

    await expect(
      savePostAction({
        slug: 'bad-post',
        title: 'Bad Post',
        description: 'Description',
        date: '2026-05-01',
        author: 'Admin',
        tags: [],
        read_time: '4 min read',
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
        image_hint: 'keyboard desk setup',
        content: '# Broken',
        published: false,
        featured: false,
      })
    ).rejects.toThrow('insert failed');
  });

  it('rejects action when auth guard fails', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    await expect(togglePublishedAction('existing-post', false)).rejects.toThrow(
      'Unauthorized'
    );
    expect(updateBlogPostFields).not.toHaveBeenCalled();
  });
});
