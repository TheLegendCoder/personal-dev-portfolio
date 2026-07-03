'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap, Draggable, EASE } from '@/lib/gsap';
import type { DesktopApp } from './apps';
import { SettingsWindow } from './settings-window';

interface WindowFrameProps {
  app: DesktopApp;
  minimized: boolean;
  boundsRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onMinimize: () => void;
}

export function WindowFrame({
  app,
  minimized,
  boundsRef,
  onClose,
  onMinimize,
}: WindowFrameProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [title, setTitle] = useState(app.title);

  useEffect(() => {
    windowRef.current?.focus();
  }, []);

  useGSAP(() => {
    const winEl = windowRef.current;
    const titleBarEl = titleBarRef.current;
    const boundsEl = boundsRef.current;
    if (!winEl || !titleBarEl || !boundsEl) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!reducedMotion) {
      gsap.from(winEl, {
        scale: 0.92,
        opacity: 0,
        y: 24,
        duration: 0.35,
        ease: EASE,
      });
    }

    const [draggable] = Draggable.create(winEl, {
      type: 'x,y',
      trigger: titleBarEl,
      bounds: boundsEl,
      edgeResistance: 0.9,
      onDragStart() {
        // Iframes swallow pointer events mid-drag (see globals.css helper)
        winEl.classList.add('desktop-window-dragging');
      },
      onDragEnd() {
        winEl.classList.remove('desktop-window-dragging');
      },
    });

    return () => draggable.kill();
  }, []);

  const handleIframeLoad = () => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      // Covers in-window navigation (e.g. blog list → post): keep the title
      // and theme in sync with the freshly loaded document.
      if (doc?.title) setTitle(doc.title);
      doc?.documentElement.classList.toggle(
        'dark',
        document.documentElement.classList.contains('dark')
      );
    } catch {
      // cross-origin navigation inside the frame — leave it alone
    }
  };

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label={app.title}
      tabIndex={-1}
      className={cn(
        'absolute inset-0 m-auto flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card focus:outline-none',
        minimized && 'hidden'
      )}
      style={{ width: 'min(960px, 82vw)', height: 'min(640px, 78vh)' }}
    >
      <div
        ref={titleBarRef}
        className="flex h-10 shrink-0 select-none items-center gap-2 border-b border-border bg-secondary/80 px-3 cursor-grab active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${app.title}`}
          className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-2.5 w-2.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </button>
        <button
          type="button"
          onClick={onMinimize}
          aria-label={`Minimize ${app.title}`}
          className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Minus className="h-2.5 w-2.5 text-amber-900 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-foreground truncate">
          {title}
        </span>
        {/* Spacer mirroring the traffic lights so the title stays centered */}
        <span className="w-[38px]" aria-hidden="true" />
      </div>

      <div className="min-h-0 flex-1">
        {app.component === 'settings' ? (
          <SettingsWindow />
        ) : (
          <iframe
            ref={iframeRef}
            src={app.href}
            title={app.title}
            onLoad={handleIframeLoad}
            className="h-full w-full bg-background"
          />
        )}
      </div>
    </div>
  );
}
