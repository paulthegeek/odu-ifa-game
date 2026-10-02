import type { Feedback } from '../app/useRound';
import { cn } from '../lib/cn';
import { OduName } from './OduName';

const BANNER =
  'flex min-h-[2.75rem] items-center gap-2 rounded-[14px] px-[0.9rem] py-[0.4rem] font-semibold motion-safe:transition-[background-color,color] motion-safe:duration-120 motion-safe:ease-[ease]';

/** Brief feedback with icon and text, never color alone. Not a live region (announced separately). */
export function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  // The empty banner keeps its height so the dock doesn't jump.
  if (!feedback) return <div className={BANNER} data-testid="feedback" aria-hidden="true" />;
  if (feedback.kind === 'correct') {
    return (
      <div
        className={cn(BANNER, 'border-2 border-correct bg-correct-bg text-correct')}
        data-testid="feedback"
        data-kind="correct"
      >
        <span aria-hidden="true">✓</span> Correct
      </div>
    );
  }
  return (
    <div
      className={cn(
        BANNER,
        'border-2 border-dashed border-incorrect bg-incorrect-bg text-incorrect [&_[lang=yo]]:text-fg',
      )}
      data-testid="feedback"
      data-kind="incorrect"
    >
      <span aria-hidden="true">✕</span> Not this one — it was <OduName id={feedback.correctId} />
    </div>
  );
}
