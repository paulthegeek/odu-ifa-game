import { useApp } from '../app/AppContext';
import type { ThemeChoice } from '../logic/storage';

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'night', label: 'Night' },
];

/** Always-visible theme switch. "Auto" follows the device's light/dark setting. */
export function ThemeToggle() {
  const { settings, updateSettings } = useApp();
  return (
    <fieldset className="theme-toggle">
      <legend>Theme</legend>
      {OPTIONS.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name="theme"
            value={o.value}
            checked={settings.theme === o.value}
            onChange={() => updateSettings({ theme: o.value })}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
