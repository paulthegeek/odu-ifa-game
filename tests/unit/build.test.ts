import { describe, expect, it } from 'vitest';
import {
  canCheck,
  checkBuild,
  cycleAt,
  cycleCell,
  describeDiff,
  emptyCells,
  positionLabel,
  setCell,
  type Cell,
} from '../../src/logic/build';
import { ALL_ODU, getOdu } from '../../src/logic/odu';

describe('build mode', () => {
  it('starts empty and cycles empty → single → double → empty', () => {
    expect(emptyCells()).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(cycleCell(0)).toBe(1);
    expect(cycleCell(1)).toBe(2);
    expect(cycleCell(2)).toBe(0);
  });

  it('keeps Check disabled until all 8 positions are filled', () => {
    let cells: Cell[] = emptyCells();
    for (let i = 0; i < 8; i++) {
      expect(canCheck(cells)).toBe(false);
      cells = setCell(cells, i, 2, false);
    }
    expect(canCheck(cells)).toBe(true);
    expect(canCheck(setCell(cells, 3, 0, false))).toBe(false);
  });

  it('matches a correctly built sign for every Odù', () => {
    for (const odu of ALL_ODU) {
      const result = checkBuild([...odu.marks], odu);
      expect(result.correct).toBe(true);
      expect(result.built.id).toBe(odu.id);
      expect(result.diffs).toHaveLength(0);
    }
  });

  it('identifies every wrong position', () => {
    const target = getOdu('osa_irete'); // II I I I | I I II I
    const built = [1, 1, 1, 1, 1, 1, 1, 2] as Cell[]; // positions 0, 6, 7 wrong
    const result = checkBuild(built, target);
    expect(result.correct).toBe(false);
    expect(result.built.id).toBe('ogbe_ogunda');
    expect(result.diffs.map((d) => d.index)).toEqual([0, 6, 7]);
    expect(result.diffs.map(describeDiff)).toEqual([
      'Right leg, mark 1: you placed single, correct is double',
      'Left leg, mark 3: you placed single, correct is double',
      'Left leg, mark 4: you placed double, correct is single',
    ]);
  });

  it('mirrors legs when asked', () => {
    const cells = cycleAt(emptyCells(), 1, true);
    expect(cells).toEqual([0, 1, 0, 0, 0, 1, 0, 0]);
    const back = cycleAt(cells, 5, true);
    expect(back).toEqual([0, 2, 0, 0, 0, 2, 0, 0]);
  });

  it('labels positions for screen readers', () => {
    expect(positionLabel(1, 2, 'opon')).toBe('Right leg, mark 2 of 4: double');
    expect(positionLabel(6, 0, 'opon')).toBe('Left leg, mark 3 of 4: empty');
    expect(positionLabel(0, 1, 'opele')).toBe('Right leg, mark 1 of 4: single, open seed');
  });
});
