import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext, type StudyOptions } from '../../src/app/AppContext';
import { StudyCard } from '../../src/components/StudyCard';
import { OduReference } from '../../src/screens/OduReference';
import type { Mode } from '../../src/logic/game';
import { MEJI_ODU } from '../../src/logic/odu';
import { DEFAULT_SETTINGS, type Settings } from '../../src/logic/storage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let onUpdate: ReturnType<typeof vi.fn<(patch: Partial<Settings>) => void>>;
let onOpenStudy: ReturnType<typeof vi.fn<(oduId: string, options?: StudyOptions) => void>>;

/** Renders the Odù reference with real settings state, so changes made on the screen re-render it. */
function Harness({ initial, children }: { initial: Settings; children: React.ReactNode }) {
  const [settings, setSettings] = useState(initial);
  const updateSettings = (patch: Partial<Settings>) => {
    onUpdate(patch);
    setSettings((prev) => ({ ...prev, ...patch }));
  };
  return (
    <AppContext.Provider value={{ settings, updateSettings, announce: () => {}, openStudy: onOpenStudy }}>
      {children}
    </AppContext.Provider>
  );
}

function render(overrides: Partial<Settings> = {}, children: React.ReactNode = <OduReference />) {
  act(() => root.render(<Harness initial={{ ...DEFAULT_SETTINGS, ...overrides }}>{children}</Harness>));
}

function gridModes(): Set<string | undefined> {
  return new Set([...container.querySelectorAll<HTMLElement>('ul [data-mode]')].map((el) => el.dataset.mode));
}

function modeRadio(value: Mode): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(`input[name="refmode"][value="${value}"]`);
  if (!input) throw new Error(`no reference mode radio for ${value}`);
  return input;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  onUpdate = vi.fn();
  onOpenStudy = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Odù reference: sign mode', () => {
  it.each(['opele', 'opon'] as const)('starts in the Setup mode (%s)', (mode) => {
    render({ mode });
    expect(modeRadio(mode).checked).toBe(true);
    expect(container.querySelectorAll('ul [data-mode]')).toHaveLength(16);
    expect(gridModes()).toEqual(new Set([mode]));
  });

  it('switching on the page redraws the signs without changing settings', () => {
    render({ mode: 'opele' });
    act(() => modeRadio('opon').click());
    expect(modeRadio('opon').checked).toBe(true);
    expect(gridModes()).toEqual(new Set(['opon']));
    act(() => modeRadio('opele').click());
    expect(gridModes()).toEqual(new Set(['opele']));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('opens the study card in the page mode', () => {
    render({ mode: 'opele' });
    act(() => modeRadio('opon').click());
    act(() => container.querySelector<HTMLButtonElement>('ul button')!.click());
    expect(onOpenStudy).toHaveBeenCalledWith(MEJI_ODU[0]!.id, { mode: 'opon' });
  });

  it('study card draws in the override mode instead of the global one', () => {
    render({ mode: 'opele' }, <StudyCard oduId={MEJI_ODU[0]!.id} mode="opon" />);
    expect(container.querySelector<HTMLElement>('article [data-mode]')?.dataset.mode).toBe('opon');
  });
});
