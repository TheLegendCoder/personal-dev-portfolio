'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { personalInfo } from "@/components/data/content";

interface DevOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevOverlay({ open, onOpenChange }: DevOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <span>🎉 Developer Mode Activated</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>You found the secret dev panel! Here's what makes this site tick:</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">Stack</h4>
              <ul className="text-muted-foreground list-disc list-inside">
                <li>Next.js 15 (App Router)</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Supabase</li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">UI / FX</h4>
              <ul className="text-muted-foreground list-disc list-inside">
                <li>Shadcn UI</li>
                <li>Lucide Icons</li>
                <li>GSAP Animations</li>
                <li>Canvas Confetti</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-sm font-medium">
              Want to work together?{' '}
              <a
                href={`mailto:${personalInfo.email}`}
                className="text-primary hover:underline"
              >
                Let's chat
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
