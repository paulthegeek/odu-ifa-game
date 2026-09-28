/**
 * Shared layout for sign drawings. Index 0–3 = right leg (top → bottom),
 * 4–7 = left leg. Drawn from the diviner's point of view: the right leg is
 * on the player's right.
 */
import type { Cell } from '../logic/build';
import { seedWord } from '../logic/build';
import type { Mode } from '../logic/game';

export interface Geometry {
  readonly width: number;
  readonly height: number;
  readonly rightX: number;
  readonly leftX: number;
  readonly rows: readonly number[];
  /** Hit-area size for editable positions, in viewBox units. */
  readonly hit: { readonly w: number; readonly h: number };
}

export const OPELE_GEOMETRY: Geometry = {
  width: 200,
  height: 300,
  rightX: 135,
  leftX: 65,
  rows: [84, 136, 188, 240],
  hit: { w: 54, h: 50 },
};

export const OPON_GEOMETRY: Geometry = {
  width: 300,
  height: 300,
  rightX: 194,
  leftX: 106,
  rows: [92, 132, 172, 212],
  hit: { w: 56, h: 38 },
};

export const geometryFor = (mode: Mode): Geometry => (mode === 'opele' ? OPELE_GEOMETRY : OPON_GEOMETRY);

export function positionPoint(g: Geometry, index: number): { x: number; y: number } {
  return { x: index < 4 ? g.rightX : g.leftX, y: g.rows[index % 4]! };
}

function cellText(c: Cell, mode: Mode): string {
  if (c === 0) return 'empty';
  if (mode === 'opele') return seedWord(c);
  return c === 1 ? 'single' : 'double';
}

/**
 * Text alternative, e.g. "Opẹ̀lẹ̀. Right leg, top to bottom: open, open, open,
 * closed. Left leg: closed, open, open, open."
 */
export function signDescription(mode: Mode, cells: readonly Cell[]): string {
  const right = cells.slice(0, 4).map((c) => cellText(c, mode));
  const left = cells.slice(4, 8).map((c) => cellText(c, mode));
  const tool = mode === 'opele' ? 'Opẹ̀lẹ̀' : 'Ọpọ́n Ifá';
  return `${tool}. Right leg, top to bottom: ${right.join(', ')}. Left leg: ${left.join(', ')}.`;
}
