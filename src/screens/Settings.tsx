import { useApp } from '../app/AppContext';
import { Choices } from '../components/Choices';
import { PageHead } from '../components/PageHead';
import { page } from '../components/ui';
import { Switch } from '../components/Switch';
import { ThemeChoices } from '../components/ThemeToggle';
import { EXTENDED_TIME_MULTIPLIER } from '../data/config';
import type { Settings as SettingsData } from '../logic/storage';

type BooleanSetting = {
  [K in keyof SettingsData]: SettingsData[K] extends boolean ? K : never;
}[keyof SettingsData];

export function Settings() {
  const { settings: s, updateSettings } = useApp();
  const toggle = (key: BooleanSetting, label: string, hint?: string) => (
    <Switch checked={s[key]} onChange={(v) => updateSettings({ [key]: v })} hint={hint}>
      {label}
    </Switch>
  );

  return (
    <div className={page}>
      <PageHead title="Settings">These settings are saved on this device.</PageHead>

      <section className="card" aria-labelledby="appearance-h">
        <h2 id="appearance-h">Appearance</h2>
        <ThemeChoices name="theme-setting" />
      </section>

      <section className="card" aria-labelledby="a11y-h">
        <h2 id="a11y-h">Accessibility</h2>
        {toggle(
          'highContrast',
          'High-contrast mode',
          'Pure black and white marks with thick strokes. Overrides the theme.',
        )}
        {toggle('largeText', 'Large text and large signs')}
        {toggle('dyslexiaSpacing', 'Dyslexia-friendly spacing', 'Wider letter, word and line spacing.')}
      </section>

      <section className="card" aria-labelledby="timing-h">
        <h2 id="timing-h">Timing</h2>
        <Choices
          variant="list"
          legend="Round timing"
          legendHidden
          name="timing"
          value={s.timing}
          onChange={(timing) => updateSettings({ timing })}
          options={[
            { value: 'standard', label: 'Standard time', detail: 'Rounds of 1 or 2 minutes' },
            {
              value: 'extended',
              label: 'Extended time',
              detail: `Rounds last ${EXTENDED_TIME_MULTIPLIER}× longer`,
            },
            {
              value: 'untimed',
              label: 'Untimed practice',
              detail: 'No clock; end the round when you choose. Not counted toward personal bests.',
            },
          ]}
        />
      </section>

      <section className="card" aria-labelledby="sound-h">
        <h2 id="sound-h">Sound</h2>
        {toggle('soundCues', 'Sound cues for correct and incorrect answers')}
      </section>
    </div>
  );
}
