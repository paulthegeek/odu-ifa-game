import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppContext } from '../../src/app/AppContext';
import { Settings as SettingsScreen } from '../../src/screens/Settings';
import { DEFAULT_SETTINGS, type Settings } from '../../src/logic/storage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

/** Renders Settings with real settings state, so changes made on the screen re-render it. */
function Harness({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const updateSettings = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));
  return (
    <AppContext.Provider value={{ settings, updateSettings, announce: () => {}, openStudy: () => {} }}>
      <SettingsScreen />
    </AppContext.Provider>
  );
}

let renders = 0;

/** Each call mounts afresh, so the new settings take effect. */
function render(overrides: Partial<Settings> = {}) {
  act(() => root.render(<Harness key={++renders} initial={{ ...DEFAULT_SETTINGS, ...overrides }} />));
}

function radio(name: string, value: string): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
  if (!input) throw new Error(`no ${name} radio for ${value}`);
  return input;
}

function lengthLabels(): string[] {
  return [...container.querySelectorAll<HTMLInputElement>('input[name="length"]')].map(
    (r) => r.closest('label')?.querySelector('span.grid > span')?.textContent ?? '',
  );
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Settings: rounds', () => {
  it('shows round length inside Standard time', () => {
    render({ timing: 'standard', length: 60 });
    expect(lengthLabels()).toEqual(['1 minute', '2 minutes']);
    expect(radio('length', '60').checked).toBe(true);
  });

  it('shows the doubled lengths inside Extended time', () => {
    render({ timing: 'extended' });
    expect(lengthLabels()).toEqual(['2 minutes', '4 minutes']);
  });

  it('has no round length for untimed practice', () => {
    render({ timing: 'untimed' });
    expect(lengthLabels()).toEqual([]);
  });

  it('keeps the chosen length when switching timing', () => {
    render({ timing: 'standard', length: 60 });
    act(() => radio('length', '120').click());
    act(() => radio('timing', 'extended').click());
    expect(radio('length', '120').checked).toBe(true);
    expect(lengthLabels()).toEqual(['2 minutes', '4 minutes']);
  });
});

describe('Settings: display', () => {
  it('always lists the three display switches', () => {
    for (const mode of ['opele', 'opon'] as const) {
      render({ mode, set: 'all' });
      for (const text of ['Show tone marks and underdots', 'Show marks (I / II)', 'Mirror legs in Build']) {
        expect(container.textContent).toContain(text);
      }
    }
  });
});
