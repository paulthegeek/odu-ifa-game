/**
 * Round state for both directions (Read and Build). Pure functions only;
 * the UI owns the clock and calls these with `now`.
 */
import { EXTENDED_TIME_MULTIPLIER, type RoundLength } from '../data/config';
import type { Mark } from '../data/odu';
import { buildChoices, type OduSet } from './distractors';
import { getOdu, type Odu } from './odu';
import { pickWeighted, type Rng } from './random';

export type Mode = 'opele' | 'opon';
export type Direction = 'read' | 'build';
export type Timing = 'standard' | 'extended' | 'untimed';

export interface RoundSettings {
  readonly mode: Mode;
  readonly direction: Direction;
  readonly set: OduSet;
  readonly length: RoundLength;
  readonly timing: Timing;
  /** Build mode, Méjì set only: building one leg fills the other. */
  readonly mirrorLegs: boolean;
}

export interface AnswerEvent {
  readonly oduId: string;
  readonly givenId: string;
  readonly correct: boolean;
  readonly responseMs: number;
  readonly ts: number;
}

export interface Miss {
  readonly oduId: string;
  readonly givenId: string;
  /** Build mode: the 8 marks the player placed. */
  readonly builtMarks?: readonly Mark[];
}

export interface RoundState {
  readonly id: string;
  readonly settings: RoundSettings;
  /** "Practice my misses": untimed, only these signs, each once. */
  readonly practice: boolean;
  readonly pool: readonly string[];
  readonly weights: readonly number[] | null;
  readonly seen: readonly string[];
  readonly currentId: string;
  /** Answer choices for Read mode (ids, shuffled). */
  readonly choices: readonly string[];
  readonly shownAt: number;
  readonly score: number;
  readonly attempted: number;
  readonly answers: readonly AnswerEvent[];
  readonly misses: readonly Miss[];
  readonly status: 'playing' | 'finished';
}

/** Round duration in seconds, or null when untimed. */
export function roundDuration(settings: RoundSettings, practice = false): number | null {
  if (practice || settings.timing === 'untimed') return null;
  return settings.timing === 'extended' ? settings.length * EXTENDED_TIME_MULTIPLIER : settings.length;
}

/**
 * Personal-best key: mode + direction + set + length (+ extended time).
 * Untimed and practice rounds have no personal best.
 */
export function personalBestKey(settings: RoundSettings, practice = false): string | null {
  if (practice || settings.timing === 'untimed') return null;
  const base = `${settings.mode}|${settings.direction}|${settings.set}|${settings.length}`;
  return settings.timing === 'extended' ? `${base}|extended` : base;
}

/** Whether mirroring applies (it is offered for the Méjì set only). */
export function mirrorActive(settings: RoundSettings): boolean {
  return settings.direction === 'build' && settings.set === 'meji' && settings.mirrorLegs;
}

function choicesFor(odu: Odu, settings: RoundSettings, rng: Rng): string[] {
  if (settings.direction !== 'read') return [];
  return buildChoices(odu, settings.set, rng).map((o) => o.id);
}

/**
 * Pick the next sign, avoiding repeats within the round while unseen signs
 * remain. Once all have been seen, any sign except the current one may follow.
 */
export function pickNext(
  pool: readonly string[],
  weights: readonly number[] | null,
  seen: readonly string[],
  currentId: string | null,
  rng: Rng,
): string {
  const seenSet = new Set(seen);
  let idx = pool.map((_, i) => i).filter((i) => !seenSet.has(pool[i]!));
  if (idx.length === 0) idx = pool.map((_, i) => i).filter((i) => pool[i] !== currentId);
  if (idx.length === 0) idx = pool.map((_, i) => i);
  const w = idx.map((i) => (weights ? weights[i]! : 1));
  return pool[pickWeighted(idx, w, rng)]!;
}

let roundCounter = 0;
export function newRoundId(now: number): string {
  roundCounter += 1;
  return `r${now.toString(36)}${roundCounter.toString(36)}`;
}

export function createRound(opts: {
  settings: RoundSettings;
  pool: readonly string[];
  weights?: readonly number[] | null;
  practice?: boolean;
  rng: Rng;
  now: number;
}): RoundState {
  const { settings, pool, rng, now } = opts;
  if (pool.length === 0) throw new Error('createRound: empty pool');
  const practice = opts.practice ?? false;
  const weights = opts.weights ?? null;
  const currentId = practice ? pool[0]! : pickNext(pool, weights, [], null, rng);
  return {
    id: newRoundId(now),
    settings,
    practice,
    pool,
    weights,
    seen: [currentId],
    currentId,
    choices: choicesFor(getOdu(currentId), settings, rng),
    shownAt: now,
    score: 0,
    attempted: 0,
    answers: [],
    misses: [],
    status: 'playing',
  };
}

/** Record an answer for the current sign. Does not advance; call `advance`. */
export function submitAnswer(
  state: RoundState,
  givenId: string,
  now: number,
  builtMarks?: readonly Mark[],
): { state: RoundState; correct: boolean } {
  if (state.status !== 'playing') return { state, correct: false };
  const correct = givenId === state.currentId;
  const event: AnswerEvent = {
    oduId: state.currentId,
    givenId,
    correct,
    responseMs: Math.max(0, now - state.shownAt),
    ts: now,
  };
  const misses = correct
    ? state.misses
    : [...state.misses, { oduId: state.currentId, givenId, ...(builtMarks ? { builtMarks } : {}) }];
  return {
    correct,
    state: {
      ...state,
      score: state.score + (correct ? 1 : 0),
      attempted: state.attempted + 1,
      answers: [...state.answers, event],
      misses,
    },
  };
}

/** Move to the next sign, or finish a practice round when every miss has been seen. */
export function advance(state: RoundState, rng: Rng, now: number): RoundState {
  if (state.status !== 'playing') return state;
  if (state.practice) {
    const nextIndex = state.seen.length;
    if (nextIndex >= state.pool.length) return finishRound(state);
    const currentId = state.pool[nextIndex]!;
    return {
      ...state,
      currentId,
      seen: [...state.seen, currentId],
      choices: choicesFor(getOdu(currentId), state.settings, rng),
      shownAt: now,
    };
  }
  const seen = state.seen.length >= state.pool.length ? [] : state.seen;
  const currentId = pickNext(state.pool, state.weights, seen, state.currentId, rng);
  return {
    ...state,
    currentId,
    seen: [...seen, currentId],
    choices: choicesFor(getOdu(currentId), state.settings, rng),
    shownAt: now,
  };
}

/** End the round. The sign on screen when time runs out is not scored. */
export function finishRound(state: RoundState): RoundState {
  return state.status === 'finished' ? state : { ...state, status: 'finished' };
}

/** Unique Odù ids seen in the round, in first-seen order (for Study links). */
export function seenOdu(state: RoundState): string[] {
  const ids = new Set<string>();
  for (const a of state.answers) ids.add(a.oduId);
  return [...ids];
}
