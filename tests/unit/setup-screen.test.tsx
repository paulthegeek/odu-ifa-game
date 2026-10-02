import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../../src/app/AppContext';
import { Setup } from '../../src/screens/Setup';
import { DEFAULT_SETTINGS, type Settings } from '../../src/logic/storage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SHOW_MARKS_TEXT = 'Show marks (I / II) beside each seed';

let container: HTMLDivElement;
let root: Root;
let onUpdate: ReturnType<typeof vi.fn<(patch: Partial<Settings>) => void>>;

/** Renders Setup with real settings state, so changes made on the screen re-render it. */
function Harness({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const updateSettings = (patch: Partial<Settings>) => {
    onUpdate(patch);
    setSettings((prev) => ({ ...prev, ...patch }));
  };
  return (
    <AppContext.Provider value={{ settings, updateSettings, announce: () => {}, openStudy: () => {} }}>
      <Setup answerCount={0} onStart={() => {}} onHelp={() => {}} onAccessibility={() => {}} />
    </AppContext.Provider>
  );
}

function render(overrides: Partial<Settings> = {}) {
  act(() => root.render(<Harness initial={{ ...DEFAULT_SETTINGS, ...overrides }} />));
}

function showMarksCheckbox(): HTMLInputElement | null {
  const label = [...container.querySelectorAll('label')].find((l) =>
    l.textContent?.includes(SHOW_MARKS_TEXT),
  );
  return label?.querySelector('input[type="checkbox"]') ?? null;
}

function modeRadio(value: Settings['mode']): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(`input[name="mode"][value="${value}"]`);
  if (!input) throw new Error(`no mode radio for ${value}`);
  return input;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  onUpdate = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Setup: show marks toggle', () => {
  it('is shown in Opẹ̀lẹ̀ mode', () => {
    render({ mode: 'opele' });
    expect(showMarksCheckbox()).not.toBeNull();
  });

  it('is hidden in Ọpọ́n Ifá mode', () => {
    render({ mode: 'opon' });
    expect(showMarksCheckbox()).toBeNull();
  });

  it('keeps the tone marks toggle in both modes', () => {
    for (const mode of ['opele', 'opon'] as const) {
      render({ mode });
      expect(container.textContent).toContain('Show tone marks and underdots');
    }
  });

  it('reflects the stored setting', () => {
    render({ mode: 'opele', showMarks: true });
    expect(showMarksCheckbox()?.checked).toBe(true);
  });

  it('updates the setting when toggled', () => {
    render({ mode: 'opele', showMarks: false });
    act(() => showMarksCheckbox()!.click());
    expect(onUpdate).toHaveBeenLastCalledWith({ showMarks: true });
    expect(showMarksCheckbox()?.checked).toBe(true);
  });

  it('hides and reappears as the mode changes, keeping its value', () => {
    render({ mode: 'opele', showMarks: true });

    act(() => modeRadio('opon').click());
    expect(showMarksCheckbox()).toBeNull();

    act(() => modeRadio('opele').click());
    expect(showMarksCheckbox()?.checked).toBe(true);
  });
});
