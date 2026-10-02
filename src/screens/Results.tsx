import { useApp } from '../app/AppContext';
import { OduName } from '../components/OduName';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { StudyCard } from '../components/StudyCard';
import { describeDiff, diffMarks } from '../logic/build';
import { roundDuration, seenOdu, type RoundState } from '../logic/game';
import { getOdu } from '../logic/odu';

const MODE_NAME = { opele: 'Opẹ̀lẹ̀', opon: 'Ọpọ́n Ifá' } as const;
const SET_NAME = { meji: '16 Méjì', all: 'All 256', weak: 'My weak Odù' } as const;

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
    <div className="page">
      <section className="result-hero" aria-labelledby="result-title">
        <p className="eyebrow">
          <span lang="yo">{MODE_NAME[mode]}</span> · {direction === 'read' ? 'Read' : 'Build'} ·{' '}
          {SET_NAME[state.settings.set]}
        </p>
        <div id="result-title">
          <ScreenTitle>{state.practice ? 'Practice complete' : 'Round complete'}</ScreenTitle>
        </div>
        <p className="big-score">
          {state.score} correct of {state.attempted}
        </p>
        {untimed ? (
          <p className="muted">
            {state.practice ? 'Practice round' : 'Untimed practice'} — not counted toward personal bests.
          </p>
        ) : isNewBest ? (
          <p className="best-badge">
            <span aria-hidden="true">★ </span>New personal best
            {previousBest !== null && ` (previous: ${previousBest})`}.
          </p>
        ) : (
          previousBest !== null && <p className="muted">Personal best for these settings: {previousBest}.</p>
        )}
        <div className="action-row">
          <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="btn" onClick={onPracticeMisses} disabled={missedIds.length === 0}>
            Practice my misses
          </button>
          <button type="button" className="btn" onClick={onProgress}>
            View progress
          </button>
          <button type="button" className="btn" onClick={onSettings}>
            Change settings
          </button>
          <button type="button" className="btn-link" onClick={onHelp}>
            How to read a sign
          </button>
        </div>
      </section>

      <section className="panel" aria-labelledby="missed-h">
        <h2 id="missed-h">Missed Odù</h2>
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
                    <div className="miss-text">
                      <p className="miss-name">
                        <OduName id={m.oduId} />
                      </p>
                      <p className="miss-given">
                        {direction === 'build' ? 'Your sign is ' : 'You chose '}
                        <OduName id={m.givenId} />
                      </p>
                      {diffs.length > 0 && (
                        <ul className="diff-list list-disc">
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
        <section className="panel" aria-labelledby="seen-h">
          <h2 id="seen-h">Study every Odù from this round</h2>
          <ul className="odu-list">
            {seen.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => openStudy(id)}>
                  <span className="sr-only">Study </span>
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
