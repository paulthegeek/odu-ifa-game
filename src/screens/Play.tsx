/** Read the sign: see a sign, choose its name. */
import { useEffect } from 'react';
import { useApp } from '../app/AppContext';
import { useRound, type RoundConfig } from '../app/useRound';
import { AnswerChoices, choiceIndexForKey } from '../components/AnswerChoices';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { LegCaptions } from '../components/LegCaptions';
import { RoundHud } from '../components/RoundHud';
import { Sign } from '../components/Sign';
import type { RoundState } from '../logic/game';
import { getOdu } from '../logic/odu';
import { hint } from '../components/ui';
import { cn } from '../lib/cn';
import { DOCK, DOCK_HEADING, ROUND, ROUND_BODY, ROUND_STAGE, STAGE_FIT } from './roundLayout';

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
    <div className={ROUND}>
      <RoundHud config={config} state={state} remainingMs={remainingMs} untimed={untimed} onEnd={finish} />
      <div className={ROUND_BODY}>
        <div className={ROUND_STAGE}>
          <Sign
            mode={mode}
            cells={odu.marks}
            showMarks={settings.showMarks}
            size="large"
            className={STAGE_FIT}
          />
          <LegCaptions mode={mode} className={STAGE_FIT} />
        </div>
        <section className={DOCK} aria-labelledby="dock-heading">
          <h2 id="dock-heading" className={DOCK_HEADING}>
            Name this Odù
          </h2>
          <AnswerChoices choices={state.choices} disabled={!!feedback} onChoose={(id) => answer(id)} />
          <FeedbackBanner feedback={feedback} />
          <p className={cn(hint, 'm-0 hidden @wide/app:block')}>Press 1–4 or A–D to answer.</p>
        </section>
      </div>
    </div>
  );
}
