import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Screen heading that takes focus when the screen appears, so keyboard and screen-reader users land at the top. */
export function ScreenTitle({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    // Focus is moved here for orientation only, so it draws no ring.
    <h1 ref={ref} tabIndex={-1} className={cn('focus:shadow-none focus:outline-none', className)}>
      {children}
    </h1>
  );
}
