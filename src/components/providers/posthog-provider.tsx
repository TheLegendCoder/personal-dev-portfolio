'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { CONSENT_CHANGE_EVENT, getConsent, type ConsentChoice } from '@/lib/consent';

interface PostHogProviderProps {
  children: React.ReactNode;
}

function loadPostHog() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!apiKey) {
    console.warn(
      'PostHog API key is missing. Set NEXT_PUBLIC_POSTHOG_KEY environment variable to enable analytics.'
    );
    return;
  }

  if (posthog.__loaded) return;

  posthog.init(apiKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    autocapture: true,
    capture_pageleave: true,
    persistence: 'localStorage',
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('PostHog loaded successfully');
  }
}

/**
 * Never initializes PostHog before the user accepts the cookie banner
 * (see CookieConsentBanner). Reacts live to a later accept/reject so a
 * choice made after mount doesn't require a page reload.
 */
export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    if (getConsent() === 'accepted') {
      loadPostHog();
    }

    const handleChange = (e: Event) => {
      const choice = (e as CustomEvent<ConsentChoice | null>).detail;
      if (choice === 'accepted') {
        loadPostHog();
      } else if (posthog.__loaded) {
        posthog.opt_out_capturing();
        posthog.reset();
      }
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
  }, []);

  return <>{children}</>;
}
