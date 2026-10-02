/** Round heads-up display: end button and title, timer ring, score and theme. */
import type { RoundConfig } from '../app/useRound';
import { roundDuration, type RoundState } from '../logic/game';
import { Icon } from './Icon';
import { ScreenTitle } from './ScreenTitle';
import { ThemeMenu } from './ThemeToggle';
import { Timer } from './Timer';
import { iconButton } from './ui';

const MODE_NAME = { opele: 'Opẹ̀lẹ̀', opon: 'Ọpọ́n Ifá' } as const;
const SET_NAME = { meji: '16 Méjì', all: 'All 256', weak: 'My weak Odù' } as const;

export function RoundHud({
  config,
  state,
  remainingMs,
  untimed,
  onEnd,
}: {
  config: RoundConfig;
  state: RoundState;
  remainingMs: number | null;
  untimed: boolean;
  onEnd: () => void;
}) {
  const { settings, practice } = config;
  const task = settings.direction === 'read' ? 'Read the sign' : 'Build the sign';
  const totalMs = (roundDuration(settings, practice) ?? 0) * 1000;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-1 @max-wide/app:grid-cols-[auto_minmax(0,1fr)_auto] @max-wide/app:justify-items-center @wide/app:px-8 @wide/app:pt-5 @wide/app:pb-2">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className={iconButton({ solid: true })} aria-label="End round" onClick={onEnd}>
          <Icon name="close" />
        </button>
        {/* The timer takes the middle on phones, so the title is for screen readers only there. */}
        <ScreenTitle className="m-0 font-sans text-[0.95rem] font-normal text-muted @max-wide/app:sr-only">
          <span lang="yo" className="font-semibold text-fg">
            {MODE_NAME[settings.mode]}
          </span>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">: </span>
          {task}
          {practice ? ': practice my misses' : ''}
          {untimed && !practice ? ' (untimed practice)' : ''}
          <span>
            <span aria-hidden="true"> · </span>
            <span className="sr-only">, </span>
            {SET_NAME[settings.set]}
          </span>
        </ScreenTitle>
      </div>
      <Timer remainingMs={remainingMs} totalMs={totalMs} untimed={untimed} />
      <div className="flex items-center justify-end gap-1">
        <p
          className="m-0 inline-flex min-h-[44px] items-center gap-[0.35rem] rounded-[22px] border border-card-border bg-surface px-[0.9rem] font-bold tabular-nums @max-wide/app:px-[0.7rem]"
          data-testid="score"
        >
          <Icon name="check" className="size-4 stroke-3 text-accent" />
          <span aria-hidden="true">
            {state.score}
            <span className="font-medium text-muted">/{state.attempted}</span>
          </span>
          <span className="sr-only">
            Score {state.score}, {state.attempted} answered
          </span>
        </p>
        <ThemeMenu />
      </div>
    </div>
  );
}
