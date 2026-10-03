import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../../src/app/AppContext';
import { Home } from '../../src/screens/Home';
import { DEFAULT_SETTINGS, type Settings } from '../../src/logic/storage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
      <Home answerCount={0} onStart={onStart} />
    </AppContext.Provider>
  );
}

let renders = 0;

/** Each call mounts afresh, so the new settings take effect. */
function render(overrides: Partial<Settings> = {}) {
  act(() => root.render(<Harness key={++renders} initial={{ ...DEFAULT_SETTINGS, ...overrides }} />));
}

function radios(name: string): HTMLInputElement[] {
  return [...container.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];
}

function labelOf(input: HTMLInputElement): string {
  // The first text span is the visible label (a hidden bold copy follows it).
  return input.closest('label')?.querySelector('span.grid > span')?.textContent ?? '';
}

/** Pretend the screen is wide (tablet or desktop). jsdom has no matchMedia, which reads as a phone. */
function asWide() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: true,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
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
  vi.unstubAllGlobals();
});

describe('Home: choices', () => {
  it('leaves display options to Settings', () => {
    render({ mode: 'opele' });
    expect(container.textContent).not.toContain('Show marks');
    expect(container.textContent).not.toContain('tone marks');
  });

  it('offers the Odù set, with My weak Odù locked until 20 answers', () => {
    render();
    expect(radios('set').map((r) => r.value)).toEqual(['meji', 'all', 'weak']);
    expect(radios('set').find((r) => r.value === 'weak')?.disabled).toBe(true);
  });

  it('leaves round length to Settings on phones', () => {
    render();
    expect(radios('length')).toHaveLength(0);
  });

  it('shows round length on wide screens, as the time a round really lasts', () => {
    asWide();
    render({ timing: 'standard' });
    expect(radios('length').map(labelOf)).toEqual(['1 minute', '2 minutes']);

    render({ timing: 'extended' });
    expect(radios('length').map(labelOf)).toEqual(['2 minutes', '4 minutes']);
  });

  it('hides round length on wide screens for untimed practice', () => {
    asWide();
    render({ timing: 'untimed' });
    expect(radios('length')).toHaveLength(0);
  });
});

describe('Home: start button', () => {
  function startButton(): HTMLButtonElement {
    const button = [...container.querySelectorAll<HTMLButtonElement>('button[aria-labelledby]')].find(
      (b) => document.getElementById(b.getAttribute('aria-labelledby')!)?.textContent === 'Start round',
    );
    if (!button) throw new Error('no Start round button');
    return button;
  }

  function directionRadio(value: 'read' | 'build'): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(`input[name="direction"][value="${value}"]`);
    if (!input) throw new Error(`no direction radio for ${value}`);
    return input;
  }

  it('starts a round in the saved direction', () => {
    render({ direction: 'build' });
    expect(directionRadio('build').checked).toBe(true);
    act(() => startButton().click());
    expect(onStart).toHaveBeenCalledWith('build');
  });

  it('starts a Read round after choosing Read', () => {
    render({ direction: 'build' });
    act(() => directionRadio('read').click());
    expect(onUpdate).toHaveBeenLastCalledWith({ direction: 'read' });
    act(() => startButton().click());
    expect(onStart).toHaveBeenCalledWith('read');
  });

  function summary(): string | null | undefined {
    return document.getElementById(startButton().getAttribute('aria-describedby')!)?.textContent;
  }

  it('sums up the round it will start, including its real length', () => {
    render({ direction: 'read', length: 120, set: 'all', timing: 'standard' });
    expect(summary()).toBe('Read · All 256 · 2 minutes');

    render({ direction: 'build', length: 120, set: 'meji', timing: 'extended' });
    expect(summary()).toBe('Build · 16 Méjì · 4 minutes');

    render({ timing: 'untimed' });
    expect(summary()).toMatch(/· Untimed$/);
  });

  it('is the only button that starts a round', () => {
    render();
    act(() => modeRadio('opon').click());
    expect(onStart).not.toHaveBeenCalled();
  });
});
