import type { Mode } from '../logic/game';
import { geometryFor } from './signGeometry';

/** "Left leg" / "Right leg (read first)" captions, centered under each column of the drawing. */
export function LegCaptions({ mode }: { mode: Mode }) {
  const g = geometryFor(mode);
  return (
    <div className="leg-captions" data-mode={mode} aria-hidden="true">
      <span style={{ left: `${(g.leftX / g.width) * 100}%` }}>Left leg</span>
      <span style={{ left: `${(g.rightX / g.width) * 100}%` }}>
        Right leg
        <br />
        (read first)
      </span>
    </div>
  );
}
