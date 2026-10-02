/** Round heads-up display: end button and title, timer ring, score and theme. */
import type { RoundConfig } from '../app/useRound';
import { roundDuration, type RoundState } from '../logic/game';
import { Icon } from './Icon';
import { ScreenTitle } from './ScreenTitle';
import { ThemeMenu } from './ThemeToggle';
import { Timer } from './Timer';

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
    <div className="hud">
      <div className="hud-start">
        <button type="button" className="icon-btn icon-btn-solid" aria-label="End round" onClick={onEnd}>
          <Icon name="close" />
        </button>
        <ScreenTitle className="hud-title">
          <span lang="yo" className="hud-mode">
            {MODE_NAME[settings.mode]}
          </span>
          <span aria-hidden="true"> · </span>
          <span className="visually-hidden">: </span>
          {task}
          {practice ? ': practice my misses' : ''}
          {untimed && !practice ? ' (untimed practice)' : ''}
          <span className="hud-set">
            <span aria-hidden="true"> · </span>
            <span className="visually-hidden">, </span>
            {SET_NAME[settings.set]}
          </span>
        </ScreenTitle>
      </div>
      <Timer remainingMs={remainingMs} totalMs={totalMs} untimed={untimed} />
      <div className="hud-end">
        <p className="score-pill">
          <Icon name="check" />
          <span aria-hidden="true">
            {state.score}
            <span className="score-of">/{state.attempted}</span>
          </span>
          <span className="visually-hidden">
            Score {state.score}, {state.attempted} answered
          </span>
        </p>
        <ThemeMenu />
      </div>
    </div>
  );
}
