import { describe, it, expect, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks for third-party dependencies (NOT mocking @/lib/supabase/server here
// so we test the real implementations)
// ---------------------------------------------------------------------------

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: vi.fn(), auth: { getUser: vi.fn() } })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ from: vi.fn(), auth: { getUser: vi.fn() } })),
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn(() => []),
      set: vi.fn(),
    })
  ),
}));

import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr';

// ---------------------------------------------------------------------------
// supabase/server.ts — real implementations
// ---------------------------------------------------------------------------

import {
  createServiceClient,
  createAnonClient,
  createClient as createServerSupabaseClient,
} from '@/lib/supabase/server';

describe('supabase/server createServiceClient()', () => {
  it('returns a Supabase client instance', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-test';

    const client = createServiceClient();
    expect(client).toBeDefined();
    expect(vi.mocked(createSupabaseJsClient)).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'service-role-key-test',
      expect.objectContaining({ global: expect.any(Object) })
    );
  });
});

describe('supabase/server createAnonClient()', () => {
  it('returns a Supabase client instance', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-test';

    const client = createAnonClient();
    expect(client).toBeDefined();
    expect(vi.mocked(createSupabaseJsClient)).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-test',
      expect.objectContaining({ global: expect.any(Object) })
    );
  });
});

describe('supabase/server createClient()', () => {
  it('calls createServerClient from @supabase/ssr with cookie handlers', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-test';

    const client = await createServerSupabaseClient();
    expect(client).toBeDefined();
    expect(vi.mocked(createServerClient)).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-test',
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });
});

// ---------------------------------------------------------------------------
// supabase/client.ts — real browser implementation
// ---------------------------------------------------------------------------

import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

describe('supabase/client createClient()', () => {
  it('calls createBrowserClient from @supabase/ssr', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-test';

    const client = createBrowserSupabaseClient();
    expect(client).toBeDefined();
    expect(vi.mocked(createBrowserClient)).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'anon-key-test'
    );
  });
});
