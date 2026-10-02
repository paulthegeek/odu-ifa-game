import { useEffect, useRef, type ReactNode } from 'react';

/** Screen heading that takes focus when the screen appears, so keyboard and screen-reader users land at the top. */
export function ScreenTitle({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} className={className ? `screen-title ${className}` : 'screen-title'}>
      {children}
    </h1>
  );
}
