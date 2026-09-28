/**
 * Progress records and analysis: accuracy, weakest Odù, mix-ups, streaks,
 * roll-up of old answers, and weak-Odù weighting. Pure functions only.
 */
import { MAX_STORED_ANSWERS, WEAKEST_LIST_SIZE, WEAKEST_MIN_ATTEMPTS, WEAK_WEIGHTING } from '../data/config';
import type { RoundLength } from '../data/config';
import type { OduSet } from './distractors';
import type { Direction, Mode, Timing } from './game';

export interface AnswerRecord {
  readonly id: string;
  readonly roundId: string;
  readonly oduId: string;
  readonly mode: Mode;
  readonly direction: Direction;
  readonly correct: boolean;
  /** Odù id the player chose (Read) or built (Build). */
  readonly givenId: string;
  readonly responseMs: number;
  readonly ts: number;
  readonly timed: boolean;
}

export interface RoundRecord {
  readonly id: string;
  readonly mode: Mode;
  readonly direction: Direction;
  readonly set: OduSet;
  readonly length: RoundLength;
  readonly timing: Timing;
  readonly practice: boolean;
  readonly score: number;
  readonly attempted: number;
  readonly ts: number;
}

export interface OduTotals {
  attempts: number;
  correct: number;
  totalMs: number;
}

export interface Rollup {
  /** Keyed by `oduId|mode|direction`. */
  readonly odu: Readonly<Record<string, OduTotals>>;
  /** Keyed by `targetId>givenId|mode|direction`. */
  readonly mixups: Readonly<Record<string, number>>;
}

export interface ProgressData {
  readonly version: 1;
  readonly answers: readonly AnswerRecord[];
  readonly rounds: readonly RoundRecord[];
  readonly rollup: Rollup;
}

export const emptyProgress = (): ProgressData => ({
  version: 1,
  answers: [],
  rounds: [],
  rollup: { odu: {}, mixups: {} },
});

export interface StatsFilter {
  readonly mode?: Mode | undefined;
  readonly direction?: Direction | undefined;
}

const rollupKey = (oduId: string, mode: Mode, direction: Direction) => `${oduId}|${mode}|${direction}`;
const mixupKey = (target: string, given: string, mode: Mode, direction: Direction) =>
  `${target}>${given}|${mode}|${direction}`;

function matches(filter: StatsFilter, mode: string, direction: string): boolean {
  return (!filter.mode || filter.mode === mode) && (!filter.direction || filter.direction === direction);
}

// ── Recording and roll-up ───────────────────────────────────────────────

/**
 * Add a round and its answers, then roll up anything beyond the most recent
 * `max` answers into per-Odù totals so long-term accuracy isn't lost.
 */
export function recordRound(
  data: ProgressData,
  round: RoundRecord,
  answers: readonly AnswerRecord[],
  max: number = MAX_STORED_ANSWERS,
): ProgressData {
  return rollUp({ ...data, rounds: [...data.rounds, round], answers: [...data.answers, ...answers] }, max);
}

export function rollUp(data: ProgressData, max: number = MAX_STORED_ANSWERS): ProgressData {
  if (data.answers.length <= max) return data;
  const sorted = [...data.answers].sort((a, b) => a.ts - b.ts);
  const old = sorted.slice(0, sorted.length - max);
  const keep = sorted.slice(sorted.length - max);
  const odu: Record<string, OduTotals> = {};
  for (const [k, v] of Object.entries(data.rollup.odu)) odu[k] = { ...v };
  const mixups: Record<string, number> = { ...data.rollup.mixups };
  for (const a of old) {
    const k = rollupKey(a.oduId, a.mode, a.direction);
    const t = (odu[k] ??= { attempts: 0, correct: 0, totalMs: 0 });
    t.attempts += 1;
    t.correct += a.correct ? 1 : 0;
    t.totalMs += a.responseMs;
    if (!a.correct) {
      const mk = mixupKey(a.oduId, a.givenId, a.mode, a.direction);
      mixups[mk] = (mixups[mk] ?? 0) + 1;
    }
  }
  return { ...data, answers: keep, rollup: { odu, mixups } };
}

// ── Statistics ──────────────────────────────────────────────────────────

export interface OduStat extends OduTotals {
  readonly oduId: string;
  readonly accuracy: number;
  readonly avgMs: number;
}

/** Per-Odù totals, including rolled-up history. */
export function oduTotals(data: ProgressData, filter: StatsFilter = {}): Map<string, OduTotals> {
  const totals = new Map<string, OduTotals>();
  const add = (oduId: string, attempts: number, correct: number, ms: number) => {
    const t = totals.get(oduId) ?? { attempts: 0, correct: 0, totalMs: 0 };
    t.attempts += attempts;
    t.correct += correct;
    t.totalMs += ms;
    totals.set(oduId, t);
  };
  for (const [key, t] of Object.entries(data.rollup.odu)) {
    const [oduId, mode, direction] = key.split('|') as [string, string, string];
    if (matches(filter, mode, direction)) add(oduId, t.attempts, t.correct, t.totalMs);
  }
  for (const a of data.answers) {
    if (matches(filter, a.mode, a.direction)) add(a.oduId, 1, a.correct ? 1 : 0, a.responseMs);
  }
  return totals;
}

export function oduStats(data: ProgressData, filter: StatsFilter = {}): Map<string, OduStat> {
  const out = new Map<string, OduStat>();
  for (const [oduId, t] of oduTotals(data, filter)) {
    out.set(oduId, {
      oduId,
      ...t,
      accuracy: t.attempts ? t.correct / t.attempts : 0,
      avgMs: t.attempts ? t.totalMs / t.attempts : 0,
    });
  }
  return out;
}

/**
 * Up to `size` Odù ranked by lowest accuracy, using only Odù with at least
 * `minAttempts` attempts; slower average response breaks ties.
 */
export function weakestOdu(
  stats: ReadonlyMap<string, OduStat>,
  minAttempts: number = WEAKEST_MIN_ATTEMPTS,
  size: number = WEAKEST_LIST_SIZE,
): OduStat[] {
  return [...stats.values()]
    .filter((s) => s.attempts >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs)
    .slice(0, size);
}

export interface MixUp {
  readonly targetId: string;
  readonly givenId: string;
  readonly count: number;
}

/** Pairs most often confused, most frequent first. */
export function mixUps(data: ProgressData, filter: StatsFilter = {}, limit = 10): MixUp[] {
  const counts = new Map<string, number>();
  for (const [key, n] of Object.entries(data.rollup.mixups)) {
    const [pair, mode, direction] = key.split('|') as [string, string, string];
    if (matches(filter, mode, direction)) counts.set(pair, (counts.get(pair) ?? 0) + n);
  }
  for (const a of data.answers) {
    if (!a.correct && matches(filter, a.mode, a.direction)) {
      const pair = `${a.oduId}>${a.givenId}`;
      counts.set(pair, (counts.get(pair) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([pair, count]) => {
      const [targetId, givenId] = pair.split('>') as [string, string];
      return { targetId, givenId, count };
    })
    .sort((a, b) => b.count - a.count || a.targetId.localeCompare(b.targetId))
    .slice(0, limit);
}

/** Total answers recorded, including rolled-up history. */
export function totalAnswers(data: ProgressData): number {
  let n = data.answers.length;
  for (const t of Object.values(data.rollup.odu)) n += t.attempts;
  return n;
}

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/** Days in a row with at least one round, ending today (or yesterday if not yet played today). */
export function currentStreak(rounds: readonly RoundRecord[], now: number): number {
  const days = new Set(rounds.map((r) => dayKey(r.ts)));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface Overview {
  readonly rounds: number;
  readonly answers: number;
  readonly accuracy: number | null;
  readonly avgMs: number | null;
  readonly streak: number;
}

export function overview(data: ProgressData, now: number): Overview {
  let attempts = 0;
  let correct = 0;
  let ms = 0;
  for (const t of oduTotals(data).values()) {
    attempts += t.attempts;
    correct += t.correct;
    ms += t.totalMs;
  }
  return {
    rounds: data.rounds.length,
    answers: attempts,
    accuracy: attempts ? correct / attempts : null,
    avgMs: attempts ? ms / attempts : null,
    streak: currentStreak(data.rounds, now),
  };
}

// ── Score over time ─────────────────────────────────────────────────────

/** Series key: mode + direction + set + length + timing (practice/untimed excluded). */
export function roundSeriesKey(
  r: Pick<RoundRecord, 'mode' | 'direction' | 'set' | 'length' | 'timing'>,
): string {
  return `${r.mode}|${r.direction}|${r.set}|${r.length}|${r.timing}`;
}

export function scoreSeries(rounds: readonly RoundRecord[], key: string): RoundRecord[] {
  return rounds
    .filter((r) => !r.practice && r.timing !== 'untimed' && roundSeriesKey(r) === key)
    .sort((a, b) => a.ts - b.ts);
}

export function seriesKeys(rounds: readonly RoundRecord[]): string[] {
  const keys = new Map<string, number>();
  for (const r of rounds) {
    if (r.practice || r.timing === 'untimed') continue;
    const k = roundSeriesKey(r);
    keys.set(k, Math.max(keys.get(k) ?? 0, r.ts));
  }
  return [...keys.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

// ── Weak-Odù weighting ──────────────────────────────────────────────────

/**
 * Weights for the "My weak Odù" set. Low accuracy and slow responses weigh
 * more; the floor keeps stronger Odù in the mix so rounds aren't discouraging.
 */
export function weakWeights(pool: readonly string[], stats: ReadonlyMap<string, OduStat>): number[] {
  const seen = pool.map((id) => stats.get(id)).filter((s): s is OduStat => !!s && s.attempts > 0);
  const maxMs = Math.max(1, ...seen.map((s) => s.avgMs));
  const minMs = Math.min(maxMs, ...seen.map((s) => s.avgMs));
  const span = Math.max(1, maxMs - minMs);
  return pool.map((id) => {
    const s = stats.get(id);
    if (!s || s.attempts === 0) return WEAK_WEIGHTING.unseen;
    const slowness = (s.avgMs - minMs) / span;
    return (
      WEAK_WEIGHTING.floor + WEAK_WEIGHTING.inaccuracy * (1 - s.accuracy) + WEAK_WEIGHTING.slowness * slowness
    );
  });
}

/** Pool for the weak set: every Odù attempted in this direction. */
export function weakPool(stats: ReadonlyMap<string, OduStat>): string[] {
  return [...stats.values()].filter((s) => s.attempts > 0).map((s) => s.oduId);
}
