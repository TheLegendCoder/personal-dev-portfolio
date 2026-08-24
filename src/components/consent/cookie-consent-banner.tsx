'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CONSENT_CHANGE_EVENT, getConsent, setConsent, type ConsentChoice } from '@/lib/consent';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentChoice | null>).detail;
      setVisible(detail === null);
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-card/95 backdrop-blur-sm shadow-lg"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="h-5 w-5 text-primary shrink-0 hidden sm:block" />
        <p className="text-sm text-muted-foreground flex-1">
          This site uses analytics cookies to understand how visitors use it.
          They&apos;re not loaded until you accept. See the{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            privacy policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => choose('rejected')}>
            Reject
          </Button>
          <Button size="sm" onClick={() => choose('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
