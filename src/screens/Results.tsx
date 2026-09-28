import { useApp } from '../app/AppContext';
import { OduName } from '../components/OduName';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { StudyCard } from '../components/StudyCard';
import { describeDiff, diffMarks } from '../logic/build';
import { roundDuration, seenOdu, type RoundState } from '../logic/game';
import { getOdu, signText } from '../logic/odu';

export interface RoundOutcome {
  readonly state: RoundState;
  readonly isNewBest: boolean;
  readonly previousBest: number | null;
}

export function Results({
  outcome,
  onPlayAgain,
  onPracticeMisses,
  onProgress,
  onSettings,
  onHelp,
}: {
  outcome: RoundOutcome;
  onPlayAgain: () => void;
  onPracticeMisses: () => void;
  onProgress: () => void;
  onSettings: () => void;
  onHelp: () => void;
}) {
  const { openStudy } = useApp();
  const { state, isNewBest, previousBest } = outcome;
  const { mode, direction } = state.settings;
  const untimed = roundDuration(state.settings, state.practice) === null;
  const seen = seenOdu(state);
  const missedIds = [...new Set(state.misses.map((m) => m.oduId))];

  return (
    <div className="stack">
      <ScreenTitle>{state.practice ? 'Practice complete' : 'Round complete'}</ScreenTitle>

      <section className="card" aria-label="Score">
        <p className="big-score">
          {state.score} correct of {state.attempted}
        </p>
        {untimed ? (
          <p className="muted">
            {state.practice ? 'Practice round' : 'Untimed practice'} — not counted toward personal bests.
          </p>
        ) : isNewBest ? (
          <p>
            <span aria-hidden="true">★ </span>New personal best
            {previousBest !== null && ` (previous: ${previousBest})`}.
          </p>
        ) : (
          previousBest !== null && <p className="muted">Personal best for these settings: {previousBest}.</p>
        )}
      </section>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" className="btn" onClick={onPracticeMisses} disabled={missedIds.length === 0}>
          Practise my misses
        </button>
        <button type="button" className="btn" onClick={onProgress}>
          View progress
        </button>
        <button type="button" className="btn" onClick={onSettings}>
          Change settings
        </button>
        <button type="button" className="btn btn-link" onClick={onHelp}>
          How to read a sign
        </button>
      </div>

      <section>
        <h2>Missed Odù</h2>
        {state.misses.length === 0 ? (
          <p className="muted">
            {state.attempted === 0 ? 'No answers this round.' : 'No misses this round.'}
          </p>
        ) : (
          <ul className="miss-list">
            {state.misses.map((m, i) => {
              const target = getOdu(m.oduId);
              const built = m.builtMarks;
              const diffs = built ? diffMarks(built, target.marks) : [];
              return (
                <li key={i} className="card">
                  <div className="miss-item">
                    <div className="miss-signs">
                      <figure>
                        <Sign mode={mode} cells={target.marks} size="small" />
                        <figcaption>{direction === 'build' ? 'Correct sign' : 'The sign'}</figcaption>
                      </figure>
                      {built && (
                        <figure>
                          <Sign
                            mode={mode}
                            cells={built}
                            size="small"
                            wrong={diffs.map((d) => d.index)}
                            label={`The sign you built, with ${diffs.length} wrong ${diffs.length === 1 ? 'position' : 'positions'} marked.`}
                          />
                          <figcaption>You built</figcaption>
                        </figure>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: 0 }}>
                        <strong>
                          <OduName id={m.oduId} />
                        </strong>
                      </p>
                      <p className="sign-text" style={{ margin: 0 }}>
                        <span className="visually-hidden">Marks, right leg then left leg: </span>
                        {signText(target.marks)}
                      </p>
                      <p style={{ margin: '0.25rem 0 0' }}>
                        {direction === 'build' ? 'Your sign is ' : 'You chose '}
                        <OduName id={m.givenId} />
                      </p>
                      {diffs.length > 0 && (
                        <ul className="diff-list">
                          {diffs.map((d) => (
                            <li key={d.index}>{describeDiff(d)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <details>
                    <summary>
                      Study notes for&nbsp;
                      <OduName id={m.oduId} />
                    </summary>
                    <StudyCard oduId={m.oduId} />
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {seen.length > 0 && (
        <section>
          <h2>Study every Odù from this round</h2>
          <ul className="odu-list">
            {seen.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => openStudy(id)}>
                  <span className="visually-hidden">Study </span>
                  <OduName id={id} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
