/**
 * Progress persistence in IndexedDB (via idb-keyval), with an in-memory
 * fallback so the game stays playable when storage is unavailable.
 * Also owns export/import and validation of progress files.
 */
import { createStore, del, get, set, type UseStore } from 'idb-keyval';
import { ROUND_LENGTHS } from '../data/config';
import { findOdu } from './odu';
import { emptyProgress, rollUp, type AnswerRecord, type ProgressData, type RoundRecord } from './progress';

const DATA_KEY = 'progress';
export const EXPORT_FORMAT = 'odu-practice-progress';

export interface ProgressStore {
  /** False when IndexedDB is unavailable and data only lasts this session. */
  readonly persistent: boolean;
  load(): Promise<ProgressData>;
  save(data: ProgressData): Promise<void>;
  clear(): Promise<void>;
}

export function memoryStore(initial: ProgressData = emptyProgress()): ProgressStore {
  let data = initial;
  return {
    persistent: false,
    load: () => Promise.resolve(data),
    save: (d) => {
      data = d;
      return Promise.resolve();
    },
    clear: () => {
      data = emptyProgress();
      return Promise.resolve();
    },
  };
}

export async function openProgressStore(): Promise<ProgressStore> {
  let store: UseStore;
  try {
    if (typeof indexedDB === 'undefined') throw new Error('No IndexedDB');
    store = createStore('odu-practice', 'progress');
    // Probe once: some browsers expose IndexedDB but throw on use.
    await get(DATA_KEY, store);
  } catch {
    return memoryStore();
  }
  const fallback = memoryStore();
  let failed = false;
  return {
    get persistent() {
      return !failed;
    },
    async load() {
      if (failed) return fallback.load();
      try {
        const raw = await get<unknown>(DATA_KEY, store);
        const parsed = raw == null ? null : validateProgress(raw);
        return parsed?.ok ? parsed.data : emptyProgress();
      } catch {
        failed = true;
        return fallback.load();
      }
    },
    async save(data) {
      await fallback.save(data);
      if (failed) return;
      try {
        await set(DATA_KEY, data, store);
      } catch {
        failed = true;
      }
    },
    async clear() {
      await fallback.clear();
      try {
        await del(DATA_KEY, store);
      } catch {
        failed = true;
      }
    },
  };
}

// ── Export / import ─────────────────────────────────────────────────────

export function exportProgress(data: ProgressData, now: number = Date.now()): string {
  return JSON.stringify({ format: EXPORT_FORMAT, exportedAt: new Date(now).toISOString(), ...data }, null, 2);
}

export type ValidationResult = { ok: true; data: ProgressData } | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isMode = (v: unknown) => v === 'opele' || v === 'opon';
const isDir = (v: unknown) => v === 'read' || v === 'build';
const isOdu = (v: unknown) => isStr(v) && !!findOdu(v);

function checkAnswer(a: unknown): a is AnswerRecord {
  return (
    isObj(a) &&
    isStr(a.id) &&
    isStr(a.roundId) &&
    isOdu(a.oduId) &&
    isOdu(a.givenId) &&
    isMode(a.mode) &&
    isDir(a.direction) &&
    typeof a.correct === 'boolean' &&
    a.correct === (a.oduId === a.givenId) &&
    isNum(a.responseMs) &&
    isNum(a.ts) &&
    typeof a.timed === 'boolean'
  );
}

function checkRound(r: unknown): r is RoundRecord {
  return (
    isObj(r) &&
    isStr(r.id) &&
    isMode(r.mode) &&
    isDir(r.direction) &&
    (r.set === 'meji' || r.set === 'all' || r.set === 'weak') &&
    (ROUND_LENGTHS as readonly unknown[]).includes(r.length) &&
    (r.timing === 'standard' || r.timing === 'extended' || r.timing === 'untimed') &&
    typeof r.practice === 'boolean' &&
    isNum(r.score) &&
    isNum(r.attempted) &&
    r.score <= r.attempted &&
    isNum(r.ts)
  );
}

function checkRollupKey(key: string, withPair: boolean): boolean {
  const [ids, mode, direction, ...rest] = key.split('|');
  if (rest.length || !isMode(mode) || !isDir(direction) || !ids) return false;
  return withPair ? ids.split('>').length === 2 && ids.split('>').every(isOdu) : isOdu(ids);
}

/** Validate an imported (or stored) progress object. */
export function validateProgress(raw: unknown): ValidationResult {
  if (!isObj(raw)) return { ok: false, error: 'This file is not a progress export.' };
  if ('format' in raw && raw.format !== EXPORT_FORMAT) {
    return { ok: false, error: 'This file is not a Mọ Odù progress export.' };
  }
  if (raw.version !== 1) return { ok: false, error: 'This progress file is from an unsupported version.' };
  const { answers, rounds, rollup } = raw;
  if (!Array.isArray(answers) || !Array.isArray(rounds) || !isObj(rollup)) {
    return { ok: false, error: 'The progress file is missing answers, rounds, or totals.' };
  }
  const badAnswer = answers.findIndex((a) => !checkAnswer(a));
  if (badAnswer >= 0) return { ok: false, error: `Answer ${badAnswer + 1} in the file is not valid.` };
  const badRound = rounds.findIndex((r) => !checkRound(r));
  if (badRound >= 0) return { ok: false, error: `Round ${badRound + 1} in the file is not valid.` };
  const { odu, mixups } = rollup;
  if (!isObj(odu) || !isObj(mixups)) return { ok: false, error: 'The totals in the file are not valid.' };
  for (const [k, t] of Object.entries(odu)) {
    if (
      !checkRollupKey(k, false) ||
      !isObj(t) ||
      !isNum(t.attempts) ||
      !isNum(t.correct) ||
      !isNum(t.totalMs) ||
      t.correct > t.attempts
    ) {
      return { ok: false, error: 'The per-Odù totals in the file are not valid.' };
    }
  }
  for (const [k, n] of Object.entries(mixups)) {
    if (!checkRollupKey(k, true) || !isNum(n)) {
      return { ok: false, error: 'The mix-up totals in the file are not valid.' };
    }
  }
  const data: ProgressData = {
    version: 1,
    answers: answers as AnswerRecord[],
    rounds: rounds as RoundRecord[],
    rollup: {
      odu: odu as ProgressData['rollup']['odu'],
      mixups: mixups as ProgressData['rollup']['mixups'],
    },
  };
  return { ok: true, data: rollUp(data) };
}

export function parseImport(text: string): ValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file could not be read. It is not valid JSON.' };
  }
  return validateProgress(raw);
}
