/** Read the sign: see a sign, choose its name. */
import { useEffect } from 'react';
import { useApp } from '../app/AppContext';
import { useRound, type RoundConfig } from '../app/useRound';
import { AnswerChoices, choiceIndexForKey } from '../components/AnswerChoices';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { LegCaptions } from '../components/LegCaptions';
import { RoundBar } from '../components/RoundBar';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import type { RoundState } from '../logic/game';
import { getOdu } from '../logic/odu';

export function Play({ config, onFinish }: { config: RoundConfig; onFinish: (s: RoundState) => void }) {
  const { settings } = useApp();
  const { state, feedback, remainingMs, untimed, answer, finish } = useRound(config, onFinish);
  const odu = getOdu(state.currentId);
  const mode = config.settings.mode;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, select, textarea, dialog[open]')) return;
      const i = choiceIndexForKey(e.key);
      const id = i >= 0 ? state.choices[i] : undefined;
      if (id) {
        e.preventDefault();
        answer(id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.choices, answer]);

  return (
    <div>
      <ScreenTitle>
        Read the sign{config.practice ? ': practice my misses' : ''}
        {untimed && !config.practice ? ' (untimed practice)' : ''}
      </ScreenTitle>
      <RoundBar state={state} remainingMs={remainingMs} untimed={untimed} onEnd={finish} />
      <div className="play-layout">
        <div className="sign-stage">
          <Sign mode={mode} cells={odu.marks} showMarks={settings.showMarks} size="large" />
          <LegCaptions mode={mode} />
        </div>
        <div className="stack">
          <AnswerChoices choices={state.choices} disabled={!!feedback} onChoose={(id) => answer(id)} />
          <FeedbackBanner feedback={feedback} />
          <p className="hint">Keys 1–4 or A–D choose an answer.</p>
        </div>
      </div>
    </div>
  );
}
