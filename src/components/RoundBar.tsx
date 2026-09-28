import type { RoundState } from '../logic/game';
import { Timer } from './Timer';

export function RoundBar({
  state,
  remainingMs,
  untimed,
  onEnd,
}: {
  state: RoundState;
  remainingMs: number | null;
  untimed: boolean;
  onEnd: () => void;
}) {
  return (
    <div className="play-bar">
      <Timer remainingMs={remainingMs} untimed={untimed} />
      <p className="score" style={{ margin: 0 }}>
        Score: {state.score}
        <span className="muted"> · {state.attempted} answered</span>
      </p>
      <button type="button" className="btn" onClick={onEnd}>
        End round
      </button>
    </div>
  );
}
