import { cn } from '../lib/cn';
import { OduName } from './OduName';
import { button } from './ui';

const KEYS = ['1', '2', '3', '4'];
const LETTERS = ['A', 'B', 'C', 'D'];

export function AnswerChoices({
  choices,
  disabled,
  onChoose,
}: {
  choices: readonly string[];
  disabled: boolean;
  onChoose: (oduId: string) => void;
}) {
  return (
    <ol
      className="m-0 grid list-none grid-cols-2 gap-[0.6rem] p-0 @wide/app:grid-cols-1 large:grid-cols-1"
      aria-label="Choose the Odù"
    >
      {choices.map((id, i) => (
        <li key={id}>
          <button
            type="button"
            className={cn(
              button(),
              'min-h-16 w-full gap-3 rounded-[18px] px-3 py-2 text-[1.05rem] @wide/app:justify-start @wide/app:rounded-ctl @wide/app:text-left @wide/app:text-[1.1rem]',
            )}
            aria-disabled={disabled || undefined}
            onClick={() => {
              if (!disabled) onChoose(id);
            }}
            aria-keyshortcuts={`${KEYS[i]} ${LETTERS[i]}`}
          >
            {/* Key hints only where a keyboard is likely: the wide layout. */}
            <span
              className="hidden size-[1.9rem] flex-none place-items-center rounded-[8px] border-2 border-border text-[0.85rem] text-muted @wide/app:inline-grid"
              aria-hidden="true"
            >
              {KEYS[i]}
            </span>
            <OduName id={id} />
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Map a key press to a choice index (1–4 or A–D), or -1. */
export function choiceIndexForKey(key: string): number {
  const k = key.toUpperCase();
  const n = KEYS.indexOf(k);
  return n >= 0 ? n : LETTERS.indexOf(k);
}
