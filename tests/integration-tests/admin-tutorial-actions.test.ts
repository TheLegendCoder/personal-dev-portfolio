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

vi.mock('@/lib/tutorial', () => ({
  upsertTutorial: vi.fn(),
  updateTutorialFields: vi.fn(),
  deleteTutorial: vi.fn(),
}));

import {
  deleteTutorialAction,
  saveTutorialAction,
  toggleTutorialFeaturedAction,
  toggleTutorialPublishedAction,
} from '@/app/admin/tutorials/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/require-auth';
import { deleteTutorial, updateTutorialFields, upsertTutorial } from '@/lib/tutorial';

const sampleTutorial = {
  slug: 'testing-with-vitest',
  title: 'Testing with Vitest',
  description: 'A guide to practical integration testing.',
  date: '2026-05-01',
  author: 'Admin',
  tags: ['Vitest', 'Testing'],
  read_time: '8 min read',
  published: true,
  featured: false,
  image: 'https://images.test/tutorial.png',
  image_hint: 'code editor tutorial',
  content: '# Testing',
};

function expectCommonTutorialRevalidations(slug: string) {
  expect(revalidatePath).toHaveBeenCalledWith('/tutorials');
  expect(revalidatePath).toHaveBeenCalledWith(`/tutorials/${slug}`);
  expect(revalidatePath).toHaveBeenCalledWith('/admin/tutorials');
  expect(revalidatePath).toHaveBeenCalledWith('/');
}

describe('admin tutorial actions integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue(undefined);
  });

  it('saveTutorialAction saves, revalidates, and redirects', async () => {
    vi.mocked(upsertTutorial).mockResolvedValue({ success: true });

    await saveTutorialAction(sampleTutorial);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(upsertTutorial).toHaveBeenCalledWith(sampleTutorial);
    expectCommonTutorialRevalidations('testing-with-vitest');
    expect(redirect).toHaveBeenCalledWith('/admin/tutorials');
  });

  it('toggleTutorialPublishedAction updates and revalidates', async () => {
    vi.mocked(updateTutorialFields).mockResolvedValue({ success: true });

    await toggleTutorialPublishedAction('testing-with-vitest', false);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(updateTutorialFields).toHaveBeenCalledWith('testing-with-vitest', {
      published: false,
    });
    expectCommonTutorialRevalidations('testing-with-vitest');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('toggleTutorialFeaturedAction updates and revalidates', async () => {
    vi.mocked(updateTutorialFields).mockResolvedValue({ success: true });

    await toggleTutorialFeaturedAction('testing-with-vitest', true);

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(updateTutorialFields).toHaveBeenCalledWith('testing-with-vitest', {
      featured: true,
    });
    expectCommonTutorialRevalidations('testing-with-vitest');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('deleteTutorialAction deletes, revalidates, and redirects', async () => {
    vi.mocked(deleteTutorial).mockResolvedValue({ success: true });

    await deleteTutorialAction('testing-with-vitest');

    expect(requireAuth).toHaveBeenCalledTimes(1);
    expect(deleteTutorial).toHaveBeenCalledWith('testing-with-vitest');
    expect(revalidatePath).toHaveBeenCalledWith('/tutorials');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/tutorials');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(redirect).toHaveBeenCalledWith('/admin/tutorials');
  });

  it('throws when saveTutorialAction persistence fails', async () => {
    vi.mocked(upsertTutorial).mockResolvedValue({
      success: false,
      error: 'tutorial insert failed',
    });

    await expect(saveTutorialAction(sampleTutorial)).rejects.toThrow('tutorial insert failed');
  });

  it('throws when toggleTutorialPublishedAction update fails', async () => {
    vi.mocked(updateTutorialFields).mockResolvedValue({
      success: false,
      error: 'tutorial update failed',
    });

    await expect(toggleTutorialPublishedAction('testing-with-vitest', true)).rejects.toThrow(
      'tutorial update failed'
    );
  });

  it('throws when deleteTutorialAction persistence fails', async () => {
    vi.mocked(deleteTutorial).mockResolvedValue({
      success: false,
      error: 'tutorial delete failed',
    });

    await expect(deleteTutorialAction('testing-with-vitest')).rejects.toThrow('tutorial delete failed');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('rejects actions when the auth guard fails', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

    await expect(deleteTutorialAction('testing-with-vitest')).rejects.toThrow('Unauthorized');
    expect(deleteTutorial).not.toHaveBeenCalled();
  });
});