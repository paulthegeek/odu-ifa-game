/**
 * Build-the-sign position state.
 * Positions 0–3: right leg, top → bottom. Positions 4–7: left leg, top → bottom.
 * 0 = empty, 1 = single mark (I), 2 = double mark (II).
 */
import { OPELE_MAPPING } from '../data/config';
import type { Mark } from '../data/odu';
import type { Mode } from './game';
import { oduFromMarks, type Odu } from './odu';

export type Cell = 0 | Mark;
export type BuildCells = readonly Cell[];

export const POSITION_COUNT = 8;

export const emptyCells = (): Cell[] => Array<Cell>(POSITION_COUNT).fill(0);

/** empty → single → double → empty */
export function cycleCell(c: Cell): Cell {
  return c === 0 ? 1 : c === 1 ? 2 : 0;
}

/** The same position on the other leg. */
export const mirrorIndex = (index: number): number => (index < 4 ? index + 4 : index - 4);

export function setCell(cells: BuildCells, index: number, value: Cell, mirror: boolean): Cell[] {
  const next = [...cells];
  next[index] = value;
  if (mirror) next[mirrorIndex(index)] = value;
  return next;
}

export function cycleAt(cells: BuildCells, index: number, mirror: boolean): Cell[] {
  return setCell(cells, index, cycleCell(cells[index]!), mirror);
}

export function isComplete(cells: BuildCells): cells is readonly Mark[] {
  return cells.length === POSITION_COUNT && cells.every((c) => c !== 0);
}

/** The Check button is enabled only when all 8 positions are filled. */
export const canCheck = isComplete;

export interface PositionDiff {
  readonly index: number;
  readonly leg: 'right' | 'left';
  /** 1–4, top to bottom. */
  readonly position: number;
  readonly placed: Mark;
  readonly expected: Mark;
}

export interface BuildCheck {
  readonly correct: boolean;
  readonly built: Odu;
  readonly diffs: readonly PositionDiff[];
}

export function positionInfo(index: number): { leg: 'right' | 'left'; position: number } {
  return { leg: index < 4 ? 'right' : 'left', position: (index % 4) + 1 };
}

export function diffMarks(placed: readonly Mark[], target: readonly Mark[]): PositionDiff[] {
  const diffs: PositionDiff[] = [];
  for (let i = 0; i < POSITION_COUNT; i++) {
    if (placed[i] !== target[i]) {
      diffs.push({ index: i, ...positionInfo(i), placed: placed[i]!, expected: target[i]! });
    }
  }
  return diffs;
}

export function checkBuild(cells: BuildCells, target: Odu): BuildCheck {
  if (!isComplete(cells)) throw new Error('checkBuild: all 8 positions must be filled');
  const built = oduFromMarks(cells);
  if (!built) throw new Error('checkBuild: no Odù for these marks');
  const diffs = diffMarks(cells, target.marks);
  return { correct: diffs.length === 0, built, diffs };
}

// ── Wording ──────────────────────────────────────────────────────────────

export const markWord = (m: Mark): string => (m === 1 ? 'single' : 'double');

/** "open" or "closed" for a mark, using the configured opẹ̀lẹ̀ mapping. */
export function seedWord(m: Mark): 'open' | 'closed' {
  return OPELE_MAPPING.open === m ? 'open' : 'closed';
}

export function cellWord(c: Cell, mode: Mode): string {
  if (c === 0) return 'empty';
  return mode === 'opele' ? `${markWord(c)}, ${seedWord(c)} seed` : markWord(c);
}

const legWord = (leg: 'right' | 'left') => (leg === 'right' ? 'Right leg' : 'Left leg');

/** Screen-reader label, e.g. "Right leg, mark 2 of 4: double". */
export function positionLabel(index: number, c: Cell, mode: Mode): string {
  const { leg, position } = positionInfo(index);
  return `${legWord(leg)}, mark ${position} of 4: ${cellWord(c, mode)}`;
}

/** e.g. "Left leg, mark 3: you placed single, correct is double". */
export function describeDiff(d: PositionDiff): string {
  return `${legWord(d.leg)}, mark ${d.position}: you placed ${markWord(d.placed)}, correct is ${markWord(d.expected)}`;
}
