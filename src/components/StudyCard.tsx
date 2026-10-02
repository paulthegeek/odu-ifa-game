/**
 * Study card: name, aliases, sign, meaning and ẹsẹ Ifá snippets with sources.
 * Only reviewed content is shown (see src/logic/study.ts).
 */
import { useEffect, useRef } from 'react';
import { useApp } from '../app/AppContext';
import type { Mode } from '../logic/game';
import { getOdu } from '../logic/odu';
import { getStudyEntries } from '../logic/study';
import { OduName, Yo } from './OduName';
import { Sign } from './Sign';
import { button, notice, stack } from './ui';

export function StudyCard({
  oduId,
  headingLevel = 3,
  mode,
}: {
  oduId: string;
  headingLevel?: 2 | 3;
  /** Overrides the global mode, e.g. from the Odù reference. */
  mode?: Mode;
}) {
  const { settings } = useApp();
  const odu = getOdu(oduId);
  const entries = getStudyEntries(oduId);
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="grid gap-3">
      <div className="flex flex-wrap items-center gap-4 rounded-card bg-stage p-3">
        <Sign mode={mode ?? settings.mode} cells={odu.marks} size="medium" showMarks={settings.showMarks} />
        <div>
          <H className="m-0">
            <OduName id={oduId} />
          </H>
          {odu.aliases.length > 0 && (
            <p className="m-0 text-muted">
              Also called:{' '}
              {odu.aliases.map((a, i) => (
                <span key={a}>
                  {i > 0 && ', '}
                  <Yo>{a}</Yo>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className={notice}>Study notes for this Odù haven’t been added yet.</p>
      ) : (
        entries.map((entry, i) => (
          <section key={i} className={stack} aria-label="Study notes">
            {import.meta.env.DEV && entry.placeholder && (
              <p className="rounded-[6px] border-2 border-dashed border-incorrect px-2 py-1 font-bold text-incorrect">
                PLACEHOLDER — replace before release (shown in development only)
              </p>
            )}
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
        ))
      )}
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
      className="max-h-[calc(100vh-2rem)] w-[min(40rem,calc(100vw-2rem))] rounded-stage border border-card-border bg-surface p-0 text-fg backdrop:bg-black/50 max-md:mx-0 max-md:mt-auto max-md:mb-0 max-md:max-h-[90dvh] max-md:w-full max-md:max-w-full max-md:rounded-b-none"
      aria-labelledby="study-dialog-title"
      onClose={onClose}
    >
      {oduId && (
        <div className="px-5 pt-5 pb-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="study-dialog-title" className="m-0 font-serif text-[1.5rem]">
              Study card
            </h2>
            <button type="button" className={button()} onClick={onClose} autoFocus>
              Close
            </button>
          </div>
          <StudyCard oduId={oduId} mode={mode} />
        </div>
      )}
    </dialog>
  );
}
