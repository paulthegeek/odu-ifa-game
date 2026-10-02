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
      <div className="timer-ring" data-untimed="true">
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle className="ring-track" cx="24" cy="24" r="21" />
        </svg>
        <p className="timer" aria-label="Untimed practice">
          Untimed
        </p>
      </div>
    );
  }
  const secs = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const frac = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0;
  return (
    <div className="timer-ring" data-low={secs <= 10}>
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle className="ring-track" cx="24" cy="24" r="21" />
        <circle
          className="ring-fill"
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
        className="timer"
        data-low={secs <= 10}
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
