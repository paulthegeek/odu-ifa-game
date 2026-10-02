import { useSyncExternalStore } from 'react';

/** Whether a media query matches, kept in sync with the viewport. False where matchMedia is missing (tests). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window.matchMedia !== 'function') return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  );
}

/** The width where the layout switches from phone (tab bar) to wide (sidebar). Keep in sync with the CSS. */
export const WIDE_QUERY = '(min-width: 48rem)';
