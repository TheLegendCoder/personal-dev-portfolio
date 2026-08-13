'use client';

import { Twitter, Linkedin, Copy } from 'lucide-react';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { triggerCelebrationFrom } from '@/lib/utils';

interface ShareButtonsProps {
  title: string;
  url: string;
  type?: 'blog' | 'tutorial';
}

export default function ShareButtons({ title, url, type = 'blog' }: ShareButtonsProps) {
  const { toast } = useToast();
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const getShareText = () => {
    if (type === 'tutorial') {
      return `Check out this tutorial: "${title}"`;
    }
    return `Check out this blog post: "${title}"`;
  };

  const handleShareX = () => {
    const text = getShareText();
    const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'The blog post URL has been copied to your clipboard.',
      });
      
      // Trigger celebration from the button
      if (copyButtonRef.current) {
        triggerCelebrationFrom(copyButtonRef.current, { intensity: 'medium' });
      }
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-12 sm:mt-16 pt-8 border-t border-border">
      <span className="text-sm font-semibold text-muted-foreground">Share this post:</span>
      <div className="flex gap-3">
        <button
          onClick={handleShareX}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'rounded-full bg-black text-white',
            'hover:bg-gray-800',
            'transition-colors duration-200',
            'text-sm font-medium'
          )}
          aria-label="Share on X (Twitter)"
        >
          <Twitter className="h-5 w-5" />
          <span>X</span>
        </button>

        <button
          onClick={handleShareLinkedIn}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'rounded-full bg-[#0A66C2] text-white',
            'hover:bg-[#094B9E]',
            'transition-colors duration-200',
            'text-sm font-medium'
          )}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
          <span>LinkedIn</span>
        </button>

        <button
          ref={copyButtonRef}
          onClick={handleCopyLink}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'rounded-full bg-accent text-accent-foreground',
            'hover:bg-accent/90',
            'transition-colors duration-200',
            'text-sm font-medium'
          )}
          aria-label="Copy link to clipboard"
        >
          <Copy className="h-5 w-5" />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
}
