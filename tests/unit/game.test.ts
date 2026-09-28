import { describe, expect, it } from 'vitest';
import {
  advance,
  createRound,
  finishRound,
  personalBestKey,
  roundDuration,
  submitAnswer,
  type RoundSettings,
} from '../../src/logic/game';
import { MEJI_ODU } from '../../src/logic/odu';
import { seededRng } from '../../src/logic/random';

const settings: RoundSettings = {
  mode: 'opele',
  direction: 'read',
  set: 'meji',
  length: 60,
  timing: 'standard',
  mirrorLegs: true,
};
const pool = MEJI_ODU.map((o) => o.id);

describe('round scoring', () => {
  it('scores correct answers and records misses', () => {
    const rng = seededRng(1);
    let s = createRound({ settings, pool, rng, now: 0 });
    expect(s.choices).toHaveLength(4);
    expect(s.choices).toContain(s.currentId);

    const first = s.currentId;
    let r = submitAnswer(s, first, 1500);
    expect(r.correct).toBe(true);
    s = advance(r.state, rng, 1500);

    const second = s.currentId;
    const wrong = s.choices.find((c) => c !== second)!;
    r = submitAnswer(s, wrong, 4000);
    expect(r.correct).toBe(false);
    s = r.state;

    expect(s.score).toBe(1);
    expect(s.attempted).toBe(2);
    expect(s.misses).toEqual([{ oduId: second, givenId: wrong }]);
    expect(s.answers.map((a) => a.responseMs)).toEqual([1500, 2500]);
  });

  it('avoids repeating a sign until the pool is used up', () => {
    const rng = seededRng(5);
    let s = createRound({ settings, pool, rng, now: 0 });
    const shown = [s.currentId];
    for (let i = 0; i < 15; i++) {
      s = advance(submitAnswer(s, s.currentId, i).state, rng, i);
      shown.push(s.currentId);
    }
    expect(new Set(shown).size).toBe(16);
    s = advance(submitAnswer(s, s.currentId, 99).state, rng, 99);
    expect(s.currentId).not.toBe(shown[15]);
  });

  it('does not score the sign on screen when the round finishes', () => {
    const rng = seededRng(2);
    let s = createRound({ settings, pool, rng, now: 0 });
    s = finishRound(s);
    const after = submitAnswer(s, s.currentId, 10);
    expect(after.state.score).toBe(0);
    expect(after.state.attempted).toBe(0);
    expect(after.state.status).toBe('finished');
  });

  it('practice rounds show each missed sign once, then finish', () => {
    const rng = seededRng(3);
    const misses = ['osa_osa', 'irete_irete'];
    let s = createRound({ settings, pool: misses, practice: true, rng, now: 0 });
    expect(s.currentId).toBe('osa_osa');
    s = advance(submitAnswer(s, 'osa_osa', 1).state, rng, 1);
    expect(s.currentId).toBe('irete_irete');
    s = advance(submitAnswer(s, 'osa_osa', 2).state, rng, 2);
    expect(s.status).toBe('finished');
    expect(s.score).toBe(1);
  });
});

describe('timing and personal bests', () => {
  it('computes round duration', () => {
    expect(roundDuration(settings)).toBe(60);
    expect(roundDuration({ ...settings, length: 120, timing: 'extended' })).toBe(240);
    expect(roundDuration({ ...settings, timing: 'untimed' })).toBeNull();
    expect(roundDuration(settings, true)).toBeNull();
  });

  it('keeps separate bests per mode, direction, set and length; none for untimed/practice', () => {
    expect(personalBestKey(settings)).toBe('opele|read|meji|60');
    expect(personalBestKey({ ...settings, direction: 'build' })).toBe('opele|build|meji|60');
    expect(personalBestKey({ ...settings, set: 'weak' })).toBe('opele|read|weak|60');
    expect(personalBestKey({ ...settings, timing: 'untimed' })).toBeNull();
    expect(personalBestKey(settings, true)).toBeNull();
  });
});
