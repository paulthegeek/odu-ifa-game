import type { Mode } from '../logic/game';
import { cn } from '../lib/cn';
import { geometryFor } from './signGeometry';

const CAPTION = 'absolute top-0 -translate-x-1/2 text-center whitespace-nowrap';

/**
 * "Left leg" / "Right leg (read first)" captions, centered under each column of the drawing.
 * With large text or wide spacing the narrow opẹ̀lẹ̀ captions would collide, so each
 * is anchored to the center gap and grows outward instead.
 */
export function LegCaptions({ mode, className }: { mode: Mode; className?: string }) {
  const g = geometryFor(mode);
  const opele = mode === 'opele';
  return (
    <div
      className={cn(
        'relative h-[2.6em] text-[0.85rem] leading-[1.3] text-muted',
        opele && '[--aspect:0.667]',
        className,
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          CAPTION,
          opele && 'roomy:right-[calc(50%+0.5rem)] roomy:left-auto! roomy:translate-none roomy:text-right',
        )}
        style={{ left: `${(g.leftX / g.width) * 100}%` }}
      >
        Left leg
      </span>
      <span
        className={cn(
          CAPTION,
          opele && 'roomy:left-[calc(50%+0.5rem)]! roomy:translate-none roomy:text-left',
        )}
        style={{ left: `${(g.rightX / g.width) * 100}%` }}
      >
        Right leg
        <br />
        (read first)
      </span>
    </div>
  );
}
