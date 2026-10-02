import type { ReactNode } from 'react';
import { ScreenTitle } from './ScreenTitle';

/** Screen title with a one-line description under it. */
export function PageHead({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <header>
      <ScreenTitle className="mb-1">{title}</ScreenTitle>
      <p className="m-0 text-muted">{children}</p>
    </header>
  );
}
