/**
 * Settings and personal bests in localStorage. Every access is wrapped so the
 * game keeps working when storage is blocked (private mode, disabled cookies).
 */
import { ROUND_LENGTHS, type RoundLength } from '../data/config';
import type { OduSet } from './distractors';
import type { Direction, Mode, Timing } from './game';

export type ThemeChoice = 'system' | 'light' | 'dark' | 'night';

export interface Settings {
  theme: ThemeChoice;
  highContrast: boolean;
  largeText: boolean;
  dyslexiaSpacing: boolean;
  soundCues: boolean;
  timing: Timing;
  showDiacritics: boolean;
  showMarks: boolean;
  mode: Mode;
  direction: Direction;
  set: OduSet;
  length: RoundLength;
  mirrorLegs: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  highContrast: false,
  largeText: false,
  dyslexiaSpacing: false,
  soundCues: false,
  timing: 'standard',
  showDiacritics: true,
  showMarks: false,
  mode: 'opele',
  direction: 'read',
  set: 'meji',
  length: 60,
  mirrorLegs: true,
};

/** Keep in sync with the inline theme script in index.html. */
export const SETTINGS_KEY = 'odu-practice:settings';
export const BESTS_KEY = 'odu-practice:bests';

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: settings last for this session only.
  }
}

const oneOf = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;
const bool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

/** Parse stored settings, ignoring anything unknown or invalid. */
export function parseSettings(raw: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  if (!raw || typeof raw !== 'object') return { ...d };
  const r = raw as Record<string, unknown>;
  return {
    theme: oneOf(r.theme, ['system', 'light', 'dark', 'night'] as const, d.theme),
    highContrast: bool(r.highContrast, d.highContrast),
    largeText: bool(r.largeText, d.largeText),
    dyslexiaSpacing: bool(r.dyslexiaSpacing, d.dyslexiaSpacing),
    soundCues: bool(r.soundCues, d.soundCues),
    timing: oneOf(r.timing, ['standard', 'extended', 'untimed'] as const, d.timing),
    showDiacritics: bool(r.showDiacritics, d.showDiacritics),
    showMarks: bool(r.showMarks, d.showMarks),
    mode: oneOf(r.mode, ['opele', 'opon'] as const, d.mode),
    direction: oneOf(r.direction, ['read', 'build'] as const, d.direction),
    // The weak set depends on progress data, so it's never restored on load.
    set: oneOf(r.set, ['meji', 'all'] as const, d.set),
    length: oneOf(r.length, ROUND_LENGTHS, d.length),
    mirrorLegs: bool(r.mirrorLegs, d.mirrorLegs),
  };
}

export const loadSettings = (): Settings => parseSettings(readJson(SETTINGS_KEY));
export const saveSettings = (s: Settings): void => writeJson(SETTINGS_KEY, s);

export type PersonalBests = Record<string, number>;

export function loadBests(): PersonalBests {
  const raw = readJson(BESTS_KEY);
  if (!raw || typeof raw !== 'object') return {};
  const out: PersonalBests = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = v;
  }
  return out;
}

/** Save a score; returns whether it is a new personal best. */
export function recordBest(key: string, score: number): { isNewBest: boolean; previous: number | null } {
  const bests = loadBests();
  const previous = bests[key] ?? null;
  const isNewBest = score > 0 && (previous === null || score > previous);
  if (isNewBest) writeJson(BESTS_KEY, { ...bests, [key]: score });
  return { isNewBest, previous };
}

export function clearBests(): void {
  try {
    window.localStorage.removeItem(BESTS_KEY);
  } catch {
    // ignore
  }
}
