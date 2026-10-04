import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Sign } from '../../src/components/Sign';
import { OPELE_MAPPING } from '../../src/data/config';
import { emptyCells } from '../../src/logic/build';
import { ALL_ODU, getOdu } from '../../src/logic/odu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(node: React.ReactNode) {
  act(() => root.render(node));
}

function seeds(): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-seed]')];
}

function labels(): string[] {
  return [...container.querySelectorAll('.mark-label')].map((el) => el.textContent ?? '');
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

describe('Opẹ̀lẹ̀ seed artwork', () => {
  it('draws each seed in the state its mark maps to, for all 256 Odù', () => {
    for (const odu of ALL_ODU) {
      render(<Sign mode="opele" cells={odu.marks} />);
      const drawn = seeds();
      expect(drawn).toHaveLength(8);
      drawn.forEach((seed, i) => {
        const expected = odu.marks[i] === OPELE_MAPPING.open ? 'open' : 'closed';
        expect(seed.dataset.seed, `${odu.id} position ${i}`).toBe(expected);
        if (expected === 'open') {
          expect(seed.querySelector('.seed-inner')).not.toBeNull();
          expect(seed.querySelector('.seed-ridge')).not.toBeNull();
          expect(seed.querySelector('.seed-shell, .seed-shine')).toBeNull();
        } else {
          expect(seed.querySelector('.seed-shell')).not.toBeNull();
          expect(seed.querySelector('.seed-ridge, .seed-inner, line')).toBeNull();
        }
      });
    }
  });

  it('Èjì Ogbè is eight open seeds, all single marks', () => {
    render(<Sign mode="opele" cells={getOdu('ogbe_ogbe').marks} showMarks />);
    expect(seeds().map((s) => s.dataset.seed)).toEqual(Array(8).fill('open'));
    expect(labels()).toEqual(Array(8).fill('I'));
  });

  it('Ọ̀yẹ̀kú Méjì is eight closed seeds, all double marks', () => {
    render(<Sign mode="opele" cells={getOdu('oyeku_oyeku').marks} showMarks />);
    expect(seeds().map((s) => s.dataset.seed)).toEqual(Array(8).fill('closed'));
    expect(labels()).toEqual(Array(8).fill('II'));
  });

  it('an empty build shows empty slots and the cord beads are not seeds', () => {
    render(<Sign mode="opele" cells={emptyCells()} />);
    expect(seeds().map((s) => s.dataset.seed)).toEqual(Array(8).fill('empty'));
    expect(container.querySelectorAll('.cord-bead')).toHaveLength(3);
    expect(container.querySelectorAll('.seed-shell')).toHaveLength(0);
  });
});
