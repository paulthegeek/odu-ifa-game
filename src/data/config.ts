/**
 * Game configuration. Values that lineages or players may reasonably want
 * to change live here, not in game logic.
 */
import type { Mark } from './odu';

/**
 * How an opẹ̀lẹ̀ seed maps to a mark.
 * Default: open (concave / inner side up) = single mark (I),
 * closed (convex / outer side up) = double mark (II).
 * Lineages differ — swap these if your house reads the other way.
 */
export const OPELE_MAPPING: { readonly open: Mark; readonly closed: Mark } = {
  open: 1,
  closed: 2,
};

/** Round lengths offered on the setup screen, in seconds. */
export const ROUND_LENGTHS = [60, 120] as const;
export type RoundLength = (typeof ROUND_LENGTHS)[number];

/** Multiplier applied to the round length when "Extended time" is chosen. */
export const EXTENDED_TIME_MULTIPLIER = 2;

/** Seconds-remaining points that are announced to screen readers. */
export const TIME_ANNOUNCEMENTS = [30, 10] as const;

/** How long feedback is shown before the next sign (ms). Correct must stay under 400. */
export const FEEDBACK_MS = { correct: 350, incorrect: 900 } as const;

/** Number of answer choices in Read mode. */
export const CHOICE_COUNT = 4;

/** Answers needed before the "My weak Odù" set is enabled. */
export const WEAK_SET_MIN_ANSWERS = 20;

/** Minimum attempts for an Odù to appear in the weakest-Odù ranking. */
export const WEAKEST_MIN_ATTEMPTS = 3;

/** Size of the weakest-Odù list. */
export const WEAKEST_LIST_SIZE = 10;

/** Most recent answers kept in full; older ones are rolled up into totals. */
export const MAX_STORED_ANSWERS = 10_000;

/** Weak-Odù weighting. The floor keeps stronger Odù in the mix. */
export const WEAK_WEIGHTING = {
  floor: 0.15,
  inaccuracy: 1,
  slowness: 0.35,
  /** Weight for Odù that have never been attempted in this mode. */
  unseen: 0.4,
} as const;
