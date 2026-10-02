import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../../src/app/AppContext';
import { Home } from '../../src/screens/Home';
import { DEFAULT_SETTINGS, type Settings } from '../../src/logic/storage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SHOW_MARKS_TEXT = 'Show marks (I / II) beside each seed';

let container: HTMLDivElement;
let root: Root;
let onUpdate: ReturnType<typeof vi.fn<(patch: Partial<Settings>) => void>>;
let onStart: ReturnType<typeof vi.fn<(direction: 'read' | 'build') => void>>;

/** Renders Home with real settings state, so changes made on the screen re-render it. */
function Harness({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState(initial);
  const updateSettings = (patch: Partial<Settings>) => {
    onUpdate(patch);
    setSettings((prev) => ({ ...prev, ...patch }));
  };
  return (
    <AppContext.Provider value={{ settings, updateSettings, announce: () => {}, openStudy: () => {} }}>
      <Home answerCount={0} onStart={onStart} onSettings={() => {}} />
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
  onStart = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Home: show marks toggle', () => {
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

describe('Home: start buttons', () => {
  function startButton(name: string): HTMLButtonElement {
    const button = [...container.querySelectorAll<HTMLButtonElement>('button[aria-labelledby]')].find(
      (b) => document.getElementById(b.getAttribute('aria-labelledby')!)?.textContent === name,
    );
    if (!button) throw new Error(`no start button named ${name}`);
    return button;
  }

  it('starts a Read round', () => {
    render();
    act(() => startButton('Read').click());
    expect(onStart).toHaveBeenCalledWith('read');
  });

  it('starts a Build round', () => {
    render();
    act(() => startButton('Build').click());
    expect(onStart).toHaveBeenCalledWith('build');
  });
});
