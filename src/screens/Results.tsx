import { useApp } from '../app/AppContext';
import { OduName } from '../components/OduName';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { StudyCard } from '../components/StudyCard';
import { describeDiff, diffMarks } from '../logic/build';
import { roundDuration, seenOdu, type RoundState } from '../logic/game';
import { getOdu } from '../logic/odu';
import { button, card, eyebrow, linkButton, oduButton, oduList, page, panel } from '../components/ui';

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
    <div className={page}>
      <section
        className="grid gap-2 rounded-stage border border-card-border bg-stage p-6"
        aria-labelledby="result-title"
      >
        <p className={eyebrow}>
          <span lang="yo">{MODE_NAME[mode]}</span> · {direction === 'read' ? 'Read' : 'Build'} ·{' '}
          {SET_NAME[state.settings.set]}
        </p>
        <div id="result-title">
          <ScreenTitle className="m-0 text-[1.6rem]">
            {state.practice ? 'Practice complete' : 'Round complete'}
          </ScreenTitle>
        </div>
        <p className="m-0 font-serif text-[2.5rem] leading-[1.15] font-semibold" data-testid="final-score">
          {state.score} correct of {state.attempted}
        </p>
        {untimed ? (
          <p className="m-0 text-muted">
            {state.practice ? 'Practice round' : 'Untimed practice'} — not counted toward personal bests.
          </p>
        ) : isNewBest ? (
          <p className="m-0 justify-self-start rounded-full border border-card-border bg-accent-soft px-[0.85rem] py-1 font-bold text-accent-on-soft">
            <span aria-hidden="true">★ </span>New personal best
            {previousBest !== null && ` (previous: ${previousBest})`}.
          </p>
        ) : (
          previousBest !== null && (
            <p className="m-0 text-muted">Personal best for these settings: {previousBest}.</p>
          )
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={button({ variant: 'primary' })} onClick={onPlayAgain}>
            Play again
          </button>
          <button
            type="button"
            className={button()}
            onClick={onPracticeMisses}
            disabled={missedIds.length === 0}
          >
            Practice my misses
          </button>
          <button type="button" className={button()} onClick={onProgress}>
            View progress
          </button>
          <button type="button" className={button()} onClick={onSettings}>
            Change settings
          </button>
          <button type="button" className={linkButton} onClick={onHelp}>
            How to read a sign
          </button>
        </div>
      </section>

      <section className={panel} aria-labelledby="missed-h">
        <h2 id="missed-h">Missed Odù</h2>
        {state.misses.length === 0 ? (
          <p className="text-muted">
            {state.attempted === 0 ? 'No answers this round.' : 'No misses this round.'}
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {state.misses.map((m, i) => {
              const target = getOdu(m.oduId);
              const built = m.builtMarks;
              const diffs = built ? diffMarks(built, target.marks) : [];
              return (
                <li key={i} className={card({ nested: true })}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
                    <div className="flex flex-wrap gap-2 *:m-0 *:w-[6.5rem] *:text-center *:text-[0.8rem] *:text-muted">
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
                    <div className="grid gap-[0.35rem] self-center">
                      <p className="m-0 font-serif text-[1.25rem] leading-[1.2] font-semibold">
                        <OduName id={m.oduId} />
                      </p>
                      <p className="m-0 text-muted [&_[lang=yo]]:font-semibold [&_[lang=yo]]:text-fg">
                        {direction === 'build' ? 'Your sign is ' : 'You chose '}
                        <OduName id={m.givenId} />
                      </p>
                      {diffs.length > 0 && (
                        <ul className="mt-[0.15rem] mb-0 list-disc pl-[1.2rem] marker:text-incorrect marker:content-['✕__']">
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
        <section className={panel} aria-labelledby="seen-h">
          <h2 id="seen-h">Study every Odù from this round</h2>
          <ul className={oduList}>
            {seen.map((id) => (
              <li key={id}>
                <button type="button" className={oduButton({ nested: true })} onClick={() => openStudy(id)}>
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
