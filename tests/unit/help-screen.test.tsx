import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../../src/app/AppContext';
import { Help } from '../../src/screens/Help';
import { DEFAULT_SETTINGS } from '../../src/logic/storage';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let onBack: ReturnType<typeof vi.fn<() => void>>;

function render(showDiacritics = true) {
  act(() =>
    root.render(
      <AppContext.Provider
        value={{
          settings: { ...DEFAULT_SETTINGS, showDiacritics },
          updateSettings: () => {},
          announce: () => {},
          openStudy: () => {},
        }}
      >
        <Help onBack={onBack} backLabel="Back to practice" />
      </AppContext.Provider>,
    ),
  );
}

const stepHeadings = () => [...container.querySelectorAll('section > div > h2')].map((h) => h.textContent);
const quizzes = () => [...container.querySelectorAll<HTMLElement>('[role="group"][aria-label^="Name the"]')];

function choose(quiz: HTMLElement, name: string) {
  const b = [...quiz.querySelectorAll('button')].find((x) => x.textContent?.includes(name));
  if (!b) throw new Error(`no choice ${name}`);
  act(() => b.click());
}

/** The feedback line that belongs to this question (the nearest one up the tree). */
function feedback(quiz: HTMLElement): Element {
  for (let el: HTMLElement | null = quiz; el; el = el.parentElement) {
    const status = el.querySelector('[role="status"]');
    if (status) return status;
  }
  throw new Error('no feedback line');
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  onBack = vi.fn();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Help', () => {
  it('teaches the Ọpọ́n Ifá before the Opẹ̀lẹ̀, in seven steps', () => {
    render();
    const steps = stepHeadings();
    expect(steps).toHaveLength(7);
    expect(steps[1]).toContain('Reading the Ọpọ́n Ifá');
    expect(steps[2]).toContain('Reading the Opẹ̀lẹ̀');
    expect(steps[6]).toBe('Step 7: Try it');
  });

  it('gives both tools a lesson with the same parts', () => {
    render();
    const parts = (id: string) => [...container.querySelectorAll(`#${id} h3`)].map((h) => h.textContent);
    expect(parts('help-opon')).toEqual(parts('help-opele'));
    expect(parts('help-opon')).toEqual([
      'What it is',
      'Which way up',
      'Single and double marks',
      'A full sign, labeled',
    ]);
  });

  it('says a single tray stroke is drawn from bottom to top', () => {
    render();
    expect(container.querySelector('#help-opon')!.textContent).toContain(
      'One stroke, drawn from bottom to top.',
    );
  });

  it('lists all 16 legs in order of seniority', () => {
    render();
    const names = [...container.querySelectorAll('#help-names li [lang="yo"]')].map((n) => n.textContent);
    expect(names).toHaveLength(16);
    expect(names[0]).toBe('Ogbè');
    expect(names[15]).toBe('Òfún');
  });

  it('explains a wrong answer and confirms the right one', () => {
    render();
    const [tray, opele] = quizzes();
    choose(tray!, 'Ìwòrì Ògúndá');
    expect(feedback(tray!).textContent).toContain('wrong order');
    choose(tray!, 'Ògúndá Ìwòrì');
    expect(feedback(tray!).textContent).toMatch(/^Correct/);

    choose(opele!, 'Ọ̀kànràn Òdí');
    expect(feedback(opele!).textContent).toContain('bottom to top');
  });

  it('honors the diacritics setting in names', () => {
    render(false);
    expect(container.querySelector('#help-order')!.textContent).toContain('Osa Irete');
  });

  it('goes back', () => {
    render();
    const back = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Back to practice')!;
    act(() => back.click());
    expect(onBack).toHaveBeenCalledOnce();
  });
});
