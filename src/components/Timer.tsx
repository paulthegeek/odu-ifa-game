import { cn } from '../lib/cn';

const RING = 'relative grid size-[3.75rem] place-items-center @wide/app:size-[4.5rem]';
const TRACK = 'fill-surface stroke-line stroke-4';

/**
 * Countdown ring. Announcements are handled by the round hook, not every second.
 * Low time is shown by a different stroke and an underline, not color alone.
 */
export function Timer({
  remainingMs,
  totalMs,
  untimed,
}: {
  remainingMs: number | null;
  totalMs: number;
  untimed: boolean;
}) {
  if (untimed || remainingMs === null) {
    return (
      <div className={RING}>
        <svg className="absolute inset-0 size-full" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle className={TRACK} cx="24" cy="24" r="21" />
        </svg>
        <p className="relative m-0 text-[0.65rem] font-bold tabular-nums" aria-label="Untimed practice">
          Untimed
        </p>
      </div>
    );
  }
  const secs = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const low = secs <= 10;
  const frac = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0;
  return (
    <div className={RING}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle className={TRACK} cx="24" cy="24" r="21" />
        <circle
          className={cn(
            'fill-none stroke-accent stroke-4 [stroke-linecap:round] motion-safe:transition-[stroke-dashoffset] motion-safe:duration-250 motion-safe:ease-linear',
            low && 'stroke-incorrect',
          )}
          cx="24"
          cy="24"
          r="21"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - frac * 100}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <p
        className={cn(
          'relative m-0 text-[1rem] font-bold tabular-nums @wide/app:text-[1.1rem]',
          low && 'underline decoration-3 underline-offset-3',
        )}
        aria-label={`Time left: ${m} minutes ${s} seconds`}
        role="timer"
      >
        <span aria-hidden="true">
          {m}:{s.toString().padStart(2, '0')}
        </span>
      </p>
    </div>
  );
}
