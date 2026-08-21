'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { gsap, EASE, prefersReducedMotion } from '@/lib/gsap';
import type { DesktopApp } from './apps';
import { TASKBAR_HEIGHT, WINDOW_MIN_H, WINDOW_MIN_W } from './constants';
import { type Bounds, type ResizeDir, useWindowResize } from './use-window-resize';
import { type SnapTarget, useWindowDrag } from './use-window-drag';
import { SettingsWindow } from './settings-window';
import { AboutPanel } from './panels/about-panel';
import { ProjectsPanel } from './panels/projects-panel';
import { ReaderPanel } from './panels/reader-panel';
import { ShortcutsPanel } from './shortcuts-panel';

export interface WindowFrameHandle {
  snap: (target: 'left' | 'right' | 'maximize' | 'restore') => void;
}

interface WindowFrameProps {
  app: DesktopApp;
  z: number;
  minimized: boolean;
  focused: boolean;
  boundsRef: React.RefObject<HTMLElement | null>;
  initialPosition: { x: number; y: number };
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
}

const RESIZE_HANDLES: { dir: ResizeDir; className: string; cursor: string }[] = [
  { dir: 'n', className: 'left-2.5 right-2.5 top-0 h-1.5', cursor: 'cursor-ns-resize' },
  { dir: 's', className: 'left-2.5 right-2.5 bottom-0 h-1.5', cursor: 'cursor-ns-resize' },
  { dir: 'w', className: 'top-2.5 bottom-2.5 left-0 w-1.5', cursor: 'cursor-ew-resize' },
  { dir: 'e', className: 'top-2.5 bottom-2.5 right-0 w-1.5', cursor: 'cursor-ew-resize' },
  { dir: 'nw', className: 'left-0 top-0 h-3 w-3', cursor: 'cursor-nwse-resize' },
  { dir: 'se', className: 'right-0 bottom-0 h-3 w-3', cursor: 'cursor-nwse-resize' },
  { dir: 'ne', className: 'right-0 top-0 h-3 w-3', cursor: 'cursor-nesw-resize' },
  { dir: 'sw', className: 'left-0 bottom-0 h-3 w-3', cursor: 'cursor-nesw-resize' },
];

function applyBoundsToEl(el: HTMLElement, bounds: Bounds) {
  el.style.left = `${bounds.x}px`;
  el.style.top = `${bounds.y}px`;
  el.style.width = `${bounds.w}px`;
  el.style.height = `${bounds.h}px`;
}

export const WindowFrame = forwardRef<WindowFrameHandle, WindowFrameProps>(function WindowFrame(
  { app, z, minimized, focused, boundsRef, initialPosition, onClose, onMinimize, onFocus },
  ref
) {
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [bounds, setBounds] = useState<Bounds>(() => ({
    x: initialPosition.x,
    y: initialPosition.y,
    w: app.defaultSize.w,
    h: app.defaultSize.h,
  }));
  const [maximized, setMaximized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const prevBoundsRef = useRef<Bounds | null>(null);
  const [title, setTitle] = useState(app.title);

  const getShellSize = useCallback(() => {
    const rect = boundsRef.current?.getBoundingClientRect();
    return {
      w: rect?.width ?? window.innerWidth,
      h: (rect?.height ?? window.innerHeight) - TASKBAR_HEIGHT,
    };
  }, [boundsRef]);

  const maximize = useCallback(() => {
    if (maximized) return;
    prevBoundsRef.current = bounds;
    setMaximized(true);
  }, [bounds, maximized]);

  const restore = useCallback(() => {
    if (!maximized) return;
    setMaximized(false);
    if (prevBoundsRef.current) setBounds(prevBoundsRef.current);
  }, [maximized]);

  const toggleMaximize = useCallback(() => {
    if (maximized) restore();
    else maximize();
  }, [maximized, maximize, restore]);

  const snapTo = useCallback(
    (target: 'left' | 'right' | 'maximize' | 'restore') => {
      if (target === 'maximize') {
        maximize();
        return;
      }
      if (target === 'restore') {
        restore();
        return;
      }
      const { w: shellW, h: shellH } = getShellSize();
      const half = Math.round(shellW / 2);
      if (!prevBoundsRef.current) prevBoundsRef.current = bounds;
      setMaximized(false);
      setBounds({
        x: target === 'left' ? 0 : half,
        y: 0,
        w: half,
        h: shellH,
      });
    },
    [bounds, getShellSize, maximize, restore]
  );

  useImperativeHandle(ref, () => ({ snap: snapTo }), [snapTo]);

  // Open animation, skipped under reduced motion.
  useGSAP(
    () => {
      const el = windowRef.current;
      if (!el) return;
      if (prefersReducedMotion()) return;
      gsap.from(el, { scale: 0.92, opacity: 0, y: 24, duration: 0.35, ease: EASE });
    },
    { scope: windowRef, dependencies: [] }
  );

  useEffect(() => {
    windowRef.current?.focus();
  }, []);

  // Keep the DOM in sync with committed bounds/maximized state (cheap, only on commit).
  useEffect(() => {
    const el = windowRef.current;
    if (!el || maximized) return;
    applyBoundsToEl(el, bounds);
  }, [bounds, maximized]);

  const handleDragEnd = useCallback(
    (delta: { dx: number; dy: number; snap: SnapTarget }) => {
      setDragging(false);
      if (delta.snap) {
        snapTo(delta.snap);
        return;
      }
      setBounds((prev) => ({ ...prev, x: prev.x + delta.dx, y: prev.y + delta.dy }));
    },
    [snapTo]
  );

  useWindowDrag({
    elRef: windowRef,
    triggerRef: titleBarRef,
    boundsRef,
    enabled: !maximized,
    onDragStart: () => setDragging(true),
    onDragEnd: handleDragEnd,
  });

  const handleResize = useCallback((next: Bounds) => {
    const el = windowRef.current;
    if (el) applyBoundsToEl(el, next);
  }, []);
  const handleResizeEnd = useCallback((next: Bounds) => {
    setBounds(next);
  }, []);
  const { startResize } = useWindowResize({
    minW: WINDOW_MIN_W,
    minH: WINDOW_MIN_H,
    onResize: handleResize,
    onResizeEnd: handleResizeEnd,
  });

  const handleIframeLoad = () => {
    const frame = iframeRef.current;
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      if (doc?.title) setTitle(doc.title);
      doc?.documentElement.classList.toggle(
        'dark',
        document.documentElement.classList.contains('dark')
      );
    } catch {
      // cross-origin navigation inside the frame — leave it alone
    }
  };

  const style = useMemo<React.CSSProperties>(() => {
    if (maximized) {
      return { left: 0, top: 0, right: 0, bottom: TASKBAR_HEIGHT, width: 'auto', height: 'auto', zIndex: z };
    }
    return { left: bounds.x, top: bounds.y, width: bounds.w, height: bounds.h, zIndex: z };
  }, [maximized, bounds, z]);

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label={app.title}
      tabIndex={-1}
      onMouseDown={onFocus}
      className={cn(
        // rounded-xl is a documented exception to the sitewide sharp-card shape
        // rule (Shape Consistency Lock, tailwind.config.ts) — native-OS window
        // chrome reads as broken at 0px corners.
        'absolute flex flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-[opacity,box-shadow] duration-150 focus:outline-none',
        focused ? 'border-primary/50 opacity-100 shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_20px_50px_-15px_hsl(var(--primary)/0.35)]' : 'border-border opacity-90',
        minimized && 'hidden',
        dragging && 'desktop-window-dragging'
      )}
      style={style}
    >
      <div
        ref={titleBarRef}
        onDoubleClick={toggleMaximize}
        className="flex h-10 shrink-0 select-none items-center gap-2 border-b border-border bg-secondary/80 px-3 cursor-grab active:cursor-grabbing"
      >
        <span className="flex-1 truncate pl-1 text-sm font-medium text-foreground">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${app.title}`}
            className="relative h-2.5 w-2.5 min-h-0 min-w-0 rounded-full bg-destructive transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-2"
          />
          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${app.title}`}
            className="relative h-2.5 w-2.5 min-h-0 min-w-0 rounded-full bg-amber-400 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-2"
          />
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label={maximized ? `Restore ${app.title}` : `Maximize ${app.title}`}
            className="relative h-2.5 w-2.5 min-h-0 min-w-0 rounded-full bg-emerald-400 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-2"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {app.component === 'settings' && <SettingsWindow />}
        {app.component === 'about' && <AboutPanel />}
        {app.component === 'projects' && <ProjectsPanel />}
        {app.component === 'blog-reader' && <ReaderPanel kind="blog" />}
        {app.component === 'tutorials-reader' && <ReaderPanel kind="tutorials" />}
        {app.component === 'shortcuts' && <ShortcutsPanel />}
        {!app.component && app.href && (
          <iframe
            ref={iframeRef}
            src={app.href}
            title={app.title}
            onLoad={handleIframeLoad}
            className="h-full w-full bg-background"
          />
        )}
      </div>

      {!maximized &&
        RESIZE_HANDLES.map(({ dir, className, cursor }) => (
          <div
            key={dir}
            onPointerDown={startResize(dir, bounds)}
            className={cn('absolute z-10', className, cursor)}
          />
        ))}
    </div>
  );
});
