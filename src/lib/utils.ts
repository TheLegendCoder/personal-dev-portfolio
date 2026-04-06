import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import confetti from "canvas-confetti"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Celebration utilities with brand colors
interface CelebrationOptions {
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
}

export function triggerCelebration(options: CelebrationOptions = {}) {
  const { intensity = 'medium', colors = ['#4F93FF', '#3DB89F', '#FFD43B'] } = options;

  const particleCount = {
    low: 30,
    medium: 50,
    high: 100,
  }[intensity];

  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 1,
    decay: 0.94,
    startVelocity: 30,
    colors,
  };

  confetti({
    ...defaults,
    particleCount,
    scalar: 0.8,
    origin: { x: 0.5, y: 0.6 },
  });
}

// Trigger confetti from a specific element
export function triggerCelebrationFrom(element: HTMLElement, options: CelebrationOptions = {}) {
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  triggerCelebrationAt(x, y, options);
}

// Trigger confetti at specific screen coordinates (0-1 range)
export function triggerCelebrationAt(x: number, y: number, options: CelebrationOptions = {}) {
  const { intensity = 'medium', colors = ['#4F93FF', '#3DB89F', '#FFD43B'] } = options;

  const particleCount = {
    low: 20,
    medium: 40,
    high: 80,
  }[intensity];

  confetti({
    particleCount,
    spread: 70,
    origin: { x, y },
    colors,
    ticks: 50,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 25,
    scalar: 0.7,
  });
}

// Milestone celebration (used for scroll milestones, achievements)
export function triggerMilestoneCelebration() {
  const end = Date.now() + 500;
  const colors = ['#4F93FF', '#3DB89F', '#FFD43B'];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
