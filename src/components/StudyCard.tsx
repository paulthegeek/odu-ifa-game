/**
 * Study card: a large sign, the name under it, then meaning and ẹsẹ Ifá snippets with sources.
 * Only reviewed content is shown (see src/logic/study.ts); with none, the card is just the sign and name.
 */
import { useEffect, useRef } from 'react';
import { useApp } from '../app/AppContext';
import type { Mode } from '../logic/game';
import { getOdu } from '../logic/odu';
import { getStudyEntries } from '../logic/study';
import { cn } from '../lib/cn';
import { OduName } from './OduName';
import { Sign } from './Sign';
import { button, stack } from './ui';

export function StudyCard({
  oduId,
  headingLevel = 3,
  headingId,
  mode,
  flush = false,
}: {
  oduId: string;
  headingLevel?: 2 | 3;
  headingId?: string;
  /** Overrides the global mode, e.g. from the Odù reference. */
  mode?: Mode;
  /** The sign's panel runs to the card's edges, as at the top of the dialog. */
  flush?: boolean;
}) {
  const { settings } = useApp();
  const odu = getOdu(oduId);
  const entries = getStudyEntries(oduId);
  const signMode = mode ?? settings.mode;
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={cn('grid gap-4', flush && 'pb-6')}>
      <div className={cn('grid justify-items-center bg-stage px-5 pt-6 pb-5', !flush && 'rounded-card')}>
        <Sign
          mode={signMode}
          cells={odu.marks}
          size="medium"
          showMarks={settings.showMarks}
          className={signMode === 'opele' ? '[--sign-width:13rem]' : '[--sign-width:18rem]'}
        />
      </div>
      <H id={headingId} className={cn('m-0 text-center font-serif text-[2rem]', flush && 'px-5')}>
        <OduName id={oduId} />
      </H>

      {entries.map((entry, i) => (
        <section key={i} className={cn(stack, flush && 'px-5')} aria-label="Study notes">
          {entry.meaning && <p lang="en">{entry.meaning}</p>}
          {entry.snippets.map((s, j) => (
            <figure key={j} className="m-0 border-l-4 border-border pl-3">
              <p className="font-semibold whitespace-pre-line" lang="yo">
                {s.yoruba}
              </p>
              <p className="whitespace-pre-line" lang="en">
                {s.english}
              </p>
              <figcaption className="text-[0.85rem] text-muted">Source: {s.source}</figcaption>
            </figure>
          ))}
        </section>
      ))}
    </article>
  );
}

/** Study card in a native modal dialog. */
export function StudyDialog({
  oduId,
  mode,
  onClose,
}: {
  oduId: string | null;
  mode?: Mode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (oduId && !dialog.open) dialog.showModal();
    if (!oduId && dialog.open) dialog.close();
  }, [oduId]);

  return (
    <dialog
      ref={ref}
      className="max-h-[calc(100vh-2rem)] w-[min(26rem,calc(100vw-2rem))] rounded-stage border border-card-border bg-surface p-0 text-fg backdrop:bg-black/50 max-md:mx-0 max-md:mt-auto max-md:mb-0 max-md:max-h-[90dvh] max-md:w-full max-md:max-w-full max-md:rounded-b-none"
      aria-labelledby="study-dialog-title"
      onClose={onClose}
    >
      {oduId && (
        <div className="relative">
          <button
            type="button"
            className={cn(button(), 'absolute top-3 right-3')}
            onClick={onClose}
            autoFocus
          >
            Close
          </button>
          <StudyCard oduId={oduId} mode={mode} headingLevel={2} headingId="study-dialog-title" flush />
        </div>
      )}
    </dialog>
  );
}
