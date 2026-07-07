'use client';

import { useCallback, useRef } from 'react';

export type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface UseWindowResizeOptions {
  minW?: number;
  minH?: number;
  /** Fired on every pointermove — intended for imperative DOM updates, not setState. */
  onResize: (bounds: Bounds) => void;
  /** Fired once on pointerup with the final bounds — safe to commit to state here. */
  onResizeEnd: (bounds: Bounds) => void;
}

function computeBounds(
  dir: ResizeDir,
  start: Bounds,
  dx: number,
  dy: number,
  minW: number,
  minH: number
): Bounds {
  let { x, y, w, h } = start;
  if (dir.includes('e')) w = Math.max(minW, start.w + dx);
  if (dir.includes('s')) h = Math.max(minH, start.h + dy);
  if (dir.includes('w')) {
    w = Math.max(minW, start.w - dx);
    x = start.x + (start.w - w);
  }
  if (dir.includes('n')) {
    h = Math.max(minH, start.h - dy);
    y = start.y + (start.h - h);
  }
  return { x, y, w, h };
}

/** Pointer-event-based resize from up to 8 edge/corner handles — GSAP's Draggable doesn't resize. */
export function useWindowResize({
  minW = 340,
  minH = 240,
  onResize,
  onResizeEnd,
}: UseWindowResizeOptions) {
  const gestureRef = useRef<{
    dir: ResizeDir;
    startX: number;
    startY: number;
    start: Bounds;
    latest: Bounds;
  } | null>(null);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const g = gestureRef.current;
      if (!g) return;
      const next = computeBounds(g.dir, g.start, e.clientX - g.startX, e.clientY - g.startY, minW, minH);
      g.latest = next;
      onResize(next);
    },
    [minW, minH, onResize]
  );

  const onPointerUp = useCallback(() => {
    const g = gestureRef.current;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    gestureRef.current = null;
    if (g) onResizeEnd(g.latest);
  }, [onPointerMove, onResizeEnd]);

  const startResize = useCallback(
    (dir: ResizeDir, start: Bounds) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      gestureRef.current = { dir, startX: e.clientX, startY: e.clientY, start, latest: start };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  return { startResize };
}
