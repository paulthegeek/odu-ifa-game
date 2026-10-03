import type { ReactNode } from 'react';
import { useApp } from '../app/AppContext';
import { Choices } from '../components/Choices';
import { PageHead } from '../components/PageHead';
import { card, page } from '../components/ui';
import { Switch } from '../components/Switch';
import { ThemeChoices } from '../components/ThemeToggle';
import { ROUND_LENGTHS } from '../data/config';
import { roundDuration } from '../logic/game';
import type { Settings as SettingsData } from '../logic/storage';
import { cn } from '../lib/cn';

type BooleanSetting = {
  [K in keyof SettingsData]: SettingsData[K] extends boolean ? K : never;
}[keyof SettingsData];

const minutesText = (seconds: number) => (seconds === 60 ? '1 minute' : `${seconds / 60} minutes`);

const TIMINGS: {
  value: SettingsData['timing'];
  label: string;
  /** Shown while the option is closed. */
  summary: string;
  /** Shown once it's chosen, above the round length. */
  chosen: string;
}[] = [
  {
    value: 'standard',
    label: 'Standard time',
    summary: '1 or 2 minutes',
    chosen: 'Choose how long each round lasts',
  },
  {
    value: 'extended',
    label: 'Extended time',
    summary: 'Rounds last 2× longer',
    chosen: 'Twice as long, for more time on each sign',
  },
  {
    value: 'untimed',
    label: 'Untimed practice',
    summary: 'No clock; end the round when you choose. Not counted toward personal bests.',
    chosen: 'No clock; end the round when you choose. Not counted toward personal bests.',
  },
];

/**
 * Timing choices as cards. The chosen card opens to show the round length, in the
 * time a round really lasts (Extended doubles it), so the two read as one choice.
 * The length is its own labelled group placed after the chosen radio, not inside
 * its label. Native radios keep the browser's arrow-key behavior.
 */
function RoundsFields() {
  const { settings: s, updateSettings } = useApp();
  return (
    <fieldset className="m-0 grid min-w-0 gap-2 border-0 p-0">
      <legend className="sr-only">Round timing</legend>
      {TIMINGS.map((t) => {
        const checked = s.timing === t.value;
        const timed = t.value !== 'untimed';
        return (
          <div
            key={t.value}
            className={cn(
              'rounded-ctl border-2 border-border bg-surface',
              checked && 'border-accent shadow-[inset_0_0_0_1px_var(--color-accent)]',
            )}
          >
            <label className="flex min-h-[48px] cursor-pointer items-start gap-3 px-4 py-3">
              <input
                type="radio"
                className="mt-[0.2rem] size-5 flex-none cursor-pointer accent-accent"
                name="timing"
                value={t.value}
                checked={checked}
                onChange={() => updateSettings({ timing: t.value })}
              />
              <span className="grid">
                <span className="font-semibold">{t.label}</span>
                <span className="text-[0.85rem] text-muted">{checked ? t.chosen : t.summary}</span>
              </span>
            </label>
            {checked && timed && (
              <div className="mx-4 mb-4 border-t border-line pt-3">
                <Choices
                  variant="segmented"
                  quiet
                  className="[&_label]:px-2 [&_label]:whitespace-nowrap"
                  legend="Round length"
                  legendClassName="mb-1"
                  name="length"
                  value={s.length}
                  onChange={(length) => updateSettings({ length })}
                  options={ROUND_LENGTHS.map((l) => ({
                    value: l,
                    label: minutesText(roundDuration({ ...s, length: l })!),
                  }))}
                />
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

export function Settings() {
  const { settings: s, updateSettings } = useApp();
  const toggle = (key: BooleanSetting, label: ReactNode, hint?: string) => (
    <Switch checked={s[key]} onChange={(v) => updateSettings({ [key]: v })} hint={hint}>
      {label}
    </Switch>
  );

  return (
    <div className={page}>
      <PageHead title="Settings">These settings are saved on this device.</PageHead>

      <section className={card()} aria-labelledby="rounds-h">
        <h2 id="rounds-h">Rounds</h2>
        <RoundsFields />
      </section>

      <section className={card()} aria-labelledby="display-h">
        <h2 id="display-h">Display</h2>
        {toggle(
          'showDiacritics',
          <>
            Show tone marks and underdots (e.g. <span lang="yo">Ọ̀sẹ́</span>)
          </>,
        )}
        {toggle('showMarks', 'Show marks (I / II) beside each seed', 'Opẹ̀lẹ̀ only. A helper for beginners.')}
        {toggle(
          'mirrorLegs',
          'Mirror legs in Build',
          'Ọpọ́n Ifá with 16 Méjì. Build one leg and it’s copied to the other.',
        )}
      </section>

      <section className={card()} aria-labelledby="appearance-h">
        <h2 id="appearance-h">Appearance</h2>
        <ThemeChoices name="theme-setting" />
      </section>

      <section className={card()} aria-labelledby="a11y-h">
        <h2 id="a11y-h">Accessibility</h2>
        {toggle(
          'highContrast',
          'High-contrast mode',
          'Pure black and white marks with thick strokes. Overrides the theme.',
        )}
        {toggle('largeText', 'Large text and large signs')}
        {toggle('dyslexiaSpacing', 'Dyslexia-friendly spacing', 'Wider letter, word and line spacing.')}
      </section>

      <section className={card()} aria-labelledby="sound-h">
        <h2 id="sound-h">Sound</h2>
        {toggle('soundCues', 'Sound cues for correct and incorrect answers')}
      </section>
    </div>
  );
}
