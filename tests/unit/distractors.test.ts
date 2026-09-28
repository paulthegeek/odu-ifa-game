import { describe, expect, it } from 'vitest';
import { buildChoices, markDistance, pickDistractors } from '../../src/logic/distractors';
import { ALL_ODU, MEJI_ODU, getOdu } from '../../src/logic/odu';
import { seededRng } from '../../src/logic/random';

describe('distractors', () => {
  it('are never the correct answer and never duplicated (all 256, many seeds)', () => {
    for (const set of ['meji', 'all', 'weak'] as const) {
      const pool = set === 'meji' ? MEJI_ODU : ALL_ODU;
      for (const target of pool) {
        for (let seed = 1; seed <= 5; seed++) {
          const d = pickDistractors(target, set, seededRng(seed));
          expect(d).toHaveLength(3);
          expect(d.map((o) => o.id)).not.toContain(target.id);
          expect(new Set(d.map((o) => o.id)).size).toBe(3);
        }
      }
    }
  });

  it('for the Méjì set, uses Méjì one mark away', () => {
    for (const target of MEJI_ODU) {
      const d = pickDistractors(target, 'meji', seededRng(7));
      for (const o of d) {
        expect(o.isMeji).toBe(true);
        expect(markDistance(o.right.pattern, target.right.pattern)).toBe(1);
      }
    }
  });

  it('for the 256 set, includes the leg swap and signs sharing a leg', () => {
    const target = getOdu('osa_irete');
    const d = pickDistractors(target, 'all', seededRng(3));
    expect(d.map((o) => o.id)).toContain('irete_osa');
    for (const o of d) {
      const sharesOrSwaps =
        o.right.id === target.right.id ||
        o.left.id === target.left.id ||
        (o.right.id === target.left.id && o.left.id === target.right.id);
      expect(sharesOrSwaps).toBe(true);
    }
  });

  it('builds 4 unique choices that include the answer', () => {
    const target = getOdu('ogbe_ogunda');
    const c = buildChoices(target, 'all', seededRng(11));
    expect(c).toHaveLength(4);
    expect(c.map((o) => o.id)).toContain(target.id);
    expect(new Set(c.map((o) => o.id)).size).toBe(4);
  });
});
