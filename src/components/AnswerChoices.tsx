import { OduName } from './OduName';

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
    <ol className="answers" aria-label="Choose the Odù">
      {choices.map((id, i) => (
        <li key={id}>
          <button
            type="button"
            className="btn answer-btn"
            aria-disabled={disabled || undefined}
            onClick={() => {
              if (!disabled) onChoose(id);
            }}
            aria-keyshortcuts={`${KEYS[i]} ${LETTERS[i]}`}
          >
            <span className="answer-key" aria-hidden="true">
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
