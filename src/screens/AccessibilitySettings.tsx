import { useApp } from '../app/AppContext';
import { ScreenTitle } from '../components/ScreenTitle';
import { EXTENDED_TIME_MULTIPLIER } from '../data/config';
import type { Settings } from '../logic/storage';

type BooleanSetting = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];

export function AccessibilitySettings({ onBack }: { onBack: () => void }) {
  const { settings: s, updateSettings } = useApp();
  const toggle = (key: BooleanSetting, label: string, hint?: string) => (
    <div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={s[key]}
          onChange={(e) => updateSettings({ [key]: e.target.checked })}
        />
        {label}
      </label>
      {hint && (
        <p className="hint" style={{ marginTop: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <div className="stack">
      <ScreenTitle>Accessibility settings</ScreenTitle>
      <p className="muted">These settings are saved on this device.</p>

      <fieldset>
        <legend>Display</legend>
        {toggle(
          'highContrast',
          'High-contrast mode',
          'Pure black and white marks with thick strokes. Overrides the theme.',
        )}
        {toggle('largeText', 'Large text and large signs')}
        {toggle('dyslexiaSpacing', 'Dyslexia-friendly spacing', 'Wider letter, word and line spacing.')}
      </fieldset>

      <fieldset>
        <legend>Timing</legend>
        <div className="choice-group">
          {(
            [
              ['standard', 'Standard time', 'Rounds of 1 or 2 minutes'],
              ['extended', 'Extended time', `Rounds last ${EXTENDED_TIME_MULTIPLIER}× longer`],
              [
                'untimed',
                'Untimed practice',
                'No clock; end the round when you choose. Not counted toward personal bests.',
              ],
            ] as const
          ).map(([value, label, detail]) => (
            <label key={value} className="choice">
              <input
                type="radio"
                name="timing"
                checked={s.timing === value}
                onChange={() => updateSettings({ timing: value })}
              />
              <span>
                <span className="choice-label">{label}</span>
                <span className="choice-detail">{detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Sound</legend>
        {toggle('soundCues', 'Sound cues for correct and incorrect answers')}
      </fieldset>

      <button type="button" className="btn btn-primary" onClick={onBack}>
        Done
      </button>
    </div>
  );
}
