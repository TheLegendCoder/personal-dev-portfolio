import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
  createAnonClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// require-auth.ts
// ---------------------------------------------------------------------------

import { requireAuth } from '@/lib/supabase/require-auth';
import { createClient } from '@/lib/supabase/server';

function makeAuthClient(user: unknown, error: unknown) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error }),
    },
  };
}

describe('requireAuth()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves without throwing when a user is authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeAuthClient({ id: 'user-123', email: 'user@example.com' }, null) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expect(requireAuth()).resolves.toBeUndefined();
  });

  it('throws Unauthorized when user is null and no error', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeAuthClient(null, null) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expect(requireAuth()).rejects.toThrow('Unauthorized');
  });

  it('throws Unauthorized when Supabase returns an error', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeAuthClient(null, { message: 'jwt expired' }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    await expect(requireAuth()).rejects.toThrow('Unauthorized');
  });
});
