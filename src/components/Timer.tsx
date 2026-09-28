/** Countdown display. Announcements are handled by the round hook, not every second. */
export function Timer({ remainingMs, untimed }: { remainingMs: number | null; untimed: boolean }) {
  if (untimed || remainingMs === null) {
    return (
      <p className="timer" aria-label="Untimed practice">
        Untimed
      </p>
    );
  }
  const secs = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
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
  );
}
