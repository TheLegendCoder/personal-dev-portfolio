'use client';

import { useEffect, useRef } from 'react';
import { Draggable, gsap } from '@/lib/gsap';

export type SnapTarget = 'left' | 'right' | 'maximize' | null;

interface UseWindowDragOptions {
  elRef: React.RefObject<HTMLElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  boundsRef: React.RefObject<HTMLElement | null>;
  /** Disabled while maximized — a maximized window shouldn't be draggable. */
  enabled: boolean;
  onDragStart?: () => void;
  onDragEnd: (delta: { dx: number; dy: number; snap: SnapTarget }) => void;
}

const SNAP_EDGE_PX = 20;
const SNAP_TOP_PX = 6;

/**
 * Wraps GSAP Draggable for one window. Draggable owns the live transform during the
 * gesture; on drag end we fold the transform delta into the element's committed
 * left/top and zero the transform, so the next drag starts from a clean baseline
 * instead of compounding an ever-growing transform offset.
 */
export function useWindowDrag({
  elRef,
  triggerRef,
  boundsRef,
  enabled,
  onDragStart,
  onDragEnd,
}: UseWindowDragOptions) {
  const instanceRef = useRef<Draggable | null>(null);

  useEffect(() => {
    const el = elRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger || !enabled) return;

    const [inst] = Draggable.create(el, {
      type: 'x,y',
      trigger,
      bounds: boundsRef.current ?? undefined,
      edgeResistance: 0.9,
      onDragStart: () => onDragStart?.(),
      onDragEnd(this: Draggable) {
        const dx = this.x;
        const dy = this.y;
        const rect = el.getBoundingClientRect();
        const shellRect = boundsRef.current?.getBoundingClientRect();
        let snap: SnapTarget = null;
        if (shellRect) {
          if (rect.top - shellRect.top <= SNAP_TOP_PX) snap = 'maximize';
          else if (rect.left - shellRect.left <= SNAP_EDGE_PX) snap = 'left';
          else if (shellRect.right - rect.right <= SNAP_EDGE_PX) snap = 'right';
        }
        const currentLeft = parseFloat(el.style.left || '0');
        const currentTop = parseFloat(el.style.top || '0');
        el.style.left = `${currentLeft + dx}px`;
        el.style.top = `${currentTop + dy}px`;
        gsap.set(el, { x: 0, y: 0 });
        onDragEnd({ dx, dy, snap });
      },
    });
    instanceRef.current = inst;
    return () => {
      inst.kill();
    };
  }, [elRef, triggerRef, boundsRef, enabled, onDragStart, onDragEnd]);

  return instanceRef;
}
