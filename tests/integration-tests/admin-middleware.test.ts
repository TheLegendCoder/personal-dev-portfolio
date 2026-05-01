import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

import { createServerClient } from '@supabase/ssr';
import { middleware } from '../../middleware';

function mockSupabaseUser(user: unknown) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  };
}

describe('middleware admin auth integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-test-key';
  });

  it('redirects unauthenticated requests from /admin/* to /admin/login', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabaseUser(null) as ReturnType<typeof createServerClient>
    );

    const request = new NextRequest('https://example.com/admin/blog');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain(
      '/admin/login?redirectedFrom=%2Fadmin%2Fblog'
    );
  });

  it('redirects authenticated users away from /admin/login to /admin/blog', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabaseUser({ id: 'user-1' }) as ReturnType<typeof createServerClient>
    );

    const request = new NextRequest('https://example.com/admin/login');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/blog');
  });

  it('allows authenticated users to access protected admin routes', async () => {
    vi.mocked(createServerClient).mockReturnValue(
      mockSupabaseUser({ id: 'user-1' }) as ReturnType<typeof createServerClient>
    );

    const request = new NextRequest('https://example.com/admin/projects');
    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
