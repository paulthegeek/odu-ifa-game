/**
 * Study card: name, aliases, sign, meaning and ẹsẹ Ifá snippets with sources.
 * Only reviewed content is shown (see src/logic/study.ts).
 */
import { useEffect, useRef } from 'react';
import { useApp } from '../app/AppContext';
import { getOdu, signText } from '../logic/odu';
import { getStudyEntries } from '../logic/study';
import { OduName, Yo } from './OduName';
import { Sign } from './Sign';

export function StudyCard({ oduId, headingLevel = 3 }: { oduId: string; headingLevel?: 2 | 3 }) {
  const { settings } = useApp();
  const odu = getOdu(oduId);
  const entries = getStudyEntries(oduId);
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="study-card">
      <div className="study-head">
        <Sign mode={settings.mode} cells={odu.marks} size="medium" showMarks={settings.showMarks} />
        <div>
          <H style={{ margin: 0 }}>
            <OduName id={oduId} />
          </H>
          {odu.aliases.length > 0 && (
            <p className="muted" style={{ margin: 0 }}>
              Also called:{' '}
              {odu.aliases.map((a, i) => (
                <span key={a}>
                  {i > 0 && ', '}
                  <Yo>{a}</Yo>
                </span>
              ))}
            </p>
          )}
          <p className="sign-text" style={{ margin: 0 }}>
            <span className="visually-hidden">Marks, right leg then left leg: </span>
            {signText(odu.marks)}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="notice">Study notes for this Odù haven’t been added yet.</p>
      ) : (
        entries.map((entry, i) => (
          <section key={i} className="stack" aria-label="Study notes">
            {import.meta.env.DEV && entry.placeholder && (
              <p className="placeholder-flag">
                PLACEHOLDER — replace before release (shown in development only)
              </p>
            )}
            {entry.meaning && <p lang="en">{entry.meaning}</p>}
            {entry.snippets.map((s, j) => (
              <figure key={j} className="snippet">
                <p className="yo" lang="yo">
                  {s.yoruba}
                </p>
                <p className="en" lang="en">
                  {s.english}
                </p>
                <figcaption className="src">Source: {s.source}</figcaption>
              </figure>
            ))}
          </section>
        ))
      )}
    </article>
  );
}

/** Study card in a native modal dialog. */
export function StudyDialog({ oduId, onClose }: { oduId: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (oduId && !dialog.open) dialog.showModal();
    if (!oduId && dialog.open) dialog.close();
  }, [oduId]);

  return (
    <dialog ref={ref} className="study-dialog" aria-labelledby="study-dialog-title" onClose={onClose}>
      {oduId && (
        <div className="dialog-body">
          <div className="dialog-head">
            <h2 id="study-dialog-title" style={{ margin: 0 }}>
              Study card
            </h2>
            <button type="button" className="btn" onClick={onClose} autoFocus>
              Close
            </button>
          </div>
          <StudyCard oduId={oduId} />
        </div>
      )}
    </dialog>
  );
}
