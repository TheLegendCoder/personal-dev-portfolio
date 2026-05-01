import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { POST } from '@/app/api/admin/signout/route';
import { createClient } from '@/lib/supabase/server';

function makeSupabaseClient(signOutResult: { error: { message: string } | null }) {
  return {
    auth: {
      signOut: vi.fn().mockResolvedValue(signOutResult),
    },
  };
}

describe('POST /api/admin/signout integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and success payload when signout succeeds', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ error: null }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
  });

  it('returns 500 and error payload when signout fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ error: { message: 'Session not found' } }) as unknown as Awaited<ReturnType<typeof createClient>>
    );

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Session not found' });
  });
});
