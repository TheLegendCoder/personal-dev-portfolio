'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { triggerCelebrationFrom } from '@/lib/utils';
import { trackContactConversion } from '@/lib/posthog-events';

/**
 * Copy-to-clipboard behaviour for an email address, shared by the footer's
 * social icon row and the /contact page. Both surfaces keep their own markup —
 * only the interaction (copy, celebrate, toast, track) lives here.
 */
export function useCopyEmail() {
  const { toast } = useToast();

  return useCallback(
    (event: React.MouseEvent<HTMLElement>, email: string) => {
      event.preventDefault();
      const target = event.currentTarget;

      navigator.clipboard
        .writeText(email)
        .then(() => {
          triggerCelebrationFrom(target, { intensity: 'low' });
          trackContactConversion('email');
          toast({
            variant: 'success',
            title: 'Email copied! ✨',
            description: `${email} is ready to paste`,
            duration: 3000,
          });
        })
        .catch(() => {
          toast({
            variant: 'destructive',
            title: "Couldn't copy email",
            description: 'Please try again',
            duration: 3000,
          });
        });
    },
    [toast]
  );
}
