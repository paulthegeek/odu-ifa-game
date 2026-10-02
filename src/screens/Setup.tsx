import type { ReactNode } from 'react';
import { useApp } from '../app/AppContext';
import { ScreenTitle } from '../components/ScreenTitle';
import { EXTENDED_TIME_MULTIPLIER, ROUND_LENGTHS, WEAK_SET_MIN_ANSWERS } from '../data/config';
import type { Settings } from '../logic/storage';

interface Option<T extends string | number> {
  value: T;
  label: ReactNode;
  detail?: ReactNode;
  disabled?: boolean;
}

function ChoiceGroup<T extends string | number>({
  legend,
  name,
  value,
  options,
  onChange,
  hint,
}: {
  legend: ReactNode;
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  hint?: ReactNode;
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="choice-group">
        {options.map((o) => (
          <label key={String(o.value)} className="choice">
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
            />
            <span>
              <span className="choice-label">{o.label}</span>
              {o.detail && <span className="choice-detail">{o.detail}</span>}
            </span>
          </label>
        ))}
      </div>
      {hint}
    </fieldset>
  );
}

const TIMING_TEXT: Record<Settings['timing'], string> = {
  standard: 'Standard time',
  extended: `Extended time (×${EXTENDED_TIME_MULTIPLIER})`,
  untimed: 'Untimed practice — doesn’t count toward personal bests',
};

export function Setup({
  answerCount,
  onStart,
  onHelp,
  onAccessibility,
}: {
  answerCount: number;
  onStart: () => void;
  onHelp: () => void;
  onAccessibility: () => void;
}) {
  const { settings: s, updateSettings } = useApp();
  const weakReady = answerCount >= WEAK_SET_MIN_ANSWERS;
  const set = s.set === 'weak' && !weakReady ? 'meji' : s.set;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onStart();
      }}
    >
      <ScreenTitle>Practice reading Odù</ScreenTitle>
      <p className="muted">
        Choose how you want to practice, then begin. New to reading signs?{' '}
        <button type="button" className="btn btn-link" onClick={onHelp}>
          How to read a sign
        </button>
      </p>

      <ChoiceGroup
        legend="Mode"
        name="mode"
        value={s.mode}
        onChange={(mode) => updateSettings({ mode })}
        options={[
          { value: 'opele', label: <span lang="yo">Opẹ̀lẹ̀</span>, detail: 'The divining chain' },
          { value: 'opon', label: <span lang="yo">Ọpọ́n Ifá</span>, detail: 'Marks in ìyẹ̀rọ̀sùn on the tray' },
        ]}
      />

      <ChoiceGroup
        legend="Direction"
        name="direction"
        value={s.direction}
        onChange={(direction) => updateSettings({ direction })}
        options={[
          { value: 'read', label: 'Read the sign', detail: 'See a sign, choose its name' },
          { value: 'build', label: 'Build the sign', detail: 'See a name, build its sign' },
        ]}
      />

      <ChoiceGroup
        legend="Odù set"
        name="set"
        value={set}
        onChange={(v) => updateSettings({ set: v })}
        options={[
          { value: 'meji', label: '16 Méjì only', detail: 'Beginner' },
          { value: 'all', label: 'All 256', detail: 'Méjì and Ọmọ Odù' },
          {
            value: 'weak',
            label: 'My weak Odù',
            detail: weakReady ? 'Weighted toward the Odù you miss' : 'Not yet available',
            disabled: !weakReady,
          },
        ]}
        hint={
          !weakReady && (
            <p className="hint" id="weak-hint">
              “My weak Odù” opens after {WEAK_SET_MIN_ANSWERS} recorded answers, so there’s enough data to
              find your weak spots. You have {answerCount} so far.
            </p>
          )
        }
      />

      {s.direction === 'build' && set === 'meji' && (
        <fieldset>
          <legend>Build options</legend>
          <label className="toggle">
            <input
              type="checkbox"
              checked={s.mirrorLegs}
              onChange={(e) => updateSettings({ mirrorLegs: e.target.checked })}
            />
            Mirror legs — build one leg and it’s copied to the other
          </label>
        </fieldset>
      )}

      <ChoiceGroup
        legend="Round length"
        name="length"
        value={s.length}
        onChange={(length) => updateSettings({ length })}
        options={ROUND_LENGTHS.map((l) => ({ value: l, label: l === 60 ? '1 minute' : `${l / 60} minutes` }))}
        hint={
          <p className="hint">
            Timing: {TIMING_TEXT[s.timing]}.{' '}
            <button type="button" className="btn btn-link" onClick={onAccessibility}>
              Change in accessibility settings
            </button>
          </p>
        }
      />

      <fieldset>
        <legend>Display</legend>
        <label className="toggle">
          <input
            type="checkbox"
            checked={s.showDiacritics}
            onChange={(e) => updateSettings({ showDiacritics: e.target.checked })}
          />
          Show tone marks and underdots (e.g. <span lang="yo">Ọ̀sẹ́</span>)
        </label>
        {s.mode === 'opele' && (
          <label className="toggle">
            <input
              type="checkbox"
              checked={s.showMarks}
              onChange={(e) => updateSettings({ showMarks: e.target.checked })}
            />
            Show marks (I / II) beside each seed — a helper for beginners
          </label>
        )}
      </fieldset>

      <button type="submit" className="btn btn-primary btn-block" style={{ fontSize: '1.15rem' }}>
        Begin
      </button>
    </form>
  );
}
