/**
 * Join class names and resolve Tailwind conflicts (the last one wins), so a
 * `className` passed in from outside can override a component's defaults.
 */
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Theme names from src/styles/app.css that tailwind-merge can't know about.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'bg',
        'stage',
        'surface',
        'surface-2',
        'fg',
        'muted',
        'line',
        'border',
        'card-border',
        'accent',
        'accent-edge',
        'on-accent',
        'accent-soft',
        'accent-on-soft',
        'link',
        'focus',
        'focus-halo',
        'correct',
        'correct-bg',
        'incorrect',
        'incorrect-bg',
      ],
      shadow: ['edge', 'edge-lg', 'edge-accent', 'edge-danger', 'pressed', 'pressed-accent', 'halo', 'card'],
      radius: ['stage', 'card', 'ctl'],
      container: ['wide'],
      ease: ['out-soft'],
      animate: ['sheet-up'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
