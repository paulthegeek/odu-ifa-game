import type { Feedback } from '../app/useRound';
import { OduName } from './OduName';

/** Brief feedback with icon and text, never color alone. Not a live region (announced separately). */
export function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return <div className="feedback" aria-hidden="true" />;
  if (feedback.kind === 'correct') {
    return (
      <div className="feedback" data-kind="correct">
        <span aria-hidden="true">✓</span> Correct
      </div>
    );
  }
  return (
    <div className="feedback" data-kind="incorrect">
      <span aria-hidden="true">✕</span> Not this one — it was <OduName id={feedback.correctId} />
    </div>
  );
}
