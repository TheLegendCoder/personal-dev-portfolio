import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    setPersonProperties: vi.fn(),
  },
}));

import posthog from 'posthog-js';
import {
  trackEvent,
  trackPageView,
  trackButtonClick,
  trackFormSubmission,
  identifyUser,
  resetUserIdentification,
  setUserProperties,
} from '@/lib/posthog-events';

describe('posthog-events', () => {
  const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const captureMock = vi.mocked(posthog.capture);
  const identifyMock = vi.mocked(posthog.identify);
  const resetMock = vi.mocked(posthog.reset);
  const setPersonPropertiesMock = vi.mocked(posthog.setPersonProperties);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey;
    }
  });

  it('trackEvent does not call capture when key is missing', () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    trackEvent('Custom Event', { source: 'test' });

    expect(captureMock).not.toHaveBeenCalled();
  });

  it('trackEvent calls capture when key exists', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    trackEvent('Custom Event', { source: 'test' });

    expect(captureMock).toHaveBeenCalledWith('Custom Event', { source: 'test' });
  });

  it('trackPageView sends merged page data', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    trackPageView('Home', { plan: 'free' });

    expect(captureMock).toHaveBeenCalledWith('Page View', {
      page_name: 'Home',
      plan: 'free',
    });
  });

  it('trackButtonClick sends merged button data', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    trackButtonClick('Get Started', { location: 'hero' });

    expect(captureMock).toHaveBeenCalledWith('Button Click', {
      button_name: 'Get Started',
      location: 'hero',
    });
  });

  it('trackFormSubmission sends merged form data', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    trackFormSubmission('Contact Form', { success: true });

    expect(captureMock).toHaveBeenCalledWith('Form Submission', {
      form_name: 'Contact Form',
      success: true,
    });
  });

  it('identifyUser sets distinctId and merges properties when key exists', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    identifyUser('user-123', { email: 'user@example.com' });

    expect(identifyMock).toHaveBeenCalledWith('user-123', {
      distinctId: 'user-123',
      email: 'user@example.com',
    });
  });

  it('identifyUser does not call identify when key is missing', () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

    identifyUser('user-123', { email: 'user@example.com' });

    expect(identifyMock).not.toHaveBeenCalled();
  });

  it('resetUserIdentification calls reset when key exists', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    resetUserIdentification();

    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it('setUserProperties calls setPersonProperties when key exists', () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test_key';

    setUserProperties({ role: 'admin' });

    expect(setPersonPropertiesMock).toHaveBeenCalledWith({ role: 'admin' });
  });
});
