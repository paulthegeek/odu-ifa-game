/**
 * Chooses plausible wrong answers.
 * - Méjì set: other Méjì whose leg pattern differs by one mark (then two, …).
 * - 256 / weak sets: the leg-swapped sign, one near-identical sign that shares
 *   a leg, then other signs sharing a leg — so the player has to read both legs.
 * Distractors are never the answer and never repeated.
 */
import { CHOICE_COUNT } from '../data/config';
import { ALL_ODU, MEJI_ODU, oduId, type Odu } from './odu';
import { shuffle, type Rng } from './random';

export type OduSet = 'meji' | 'all' | 'weak';

export function markDistance(a: readonly number[], b: readonly number[]): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function mejiOrder(target: Odu, rng: Rng): Odu[] {
  const others = shuffle(
    MEJI_ODU.filter((o) => o.id !== target.id),
    rng,
  );
  const dist = (o: Odu) => markDistance(o.right.pattern, target.right.pattern);
  // Stable sort keeps the shuffle within each distance.
  return others.sort((a, b) => dist(a) - dist(b));
}

function fullOrder(target: Odu, rng: Rng): Odu[] {
  const sharesLeg = shuffle(
    ALL_ODU.filter(
      (o) => o.id !== target.id && (o.right.id === target.right.id || o.left.id === target.left.id),
    ),
    rng,
  );
  const swapped = target.isMeji ? [] : [oduId(target.left.id, target.right.id)];
  const nearOne = sharesLeg.filter((o) => markDistance(o.marks, target.marks) === 1).slice(0, 1);
  return [
    ...ALL_ODU.filter((o) => swapped.includes(o.id)),
    ...nearOne,
    ...sharesLeg,
    ...shuffle(ALL_ODU, rng),
  ];
}

/** Returns `CHOICE_COUNT - 1` unique distractors, in order of preference. */
export function pickDistractors(target: Odu, set: OduSet, rng: Rng): Odu[] {
  const order = set === 'meji' ? mejiOrder(target, rng) : fullOrder(target, rng);
  const seen = new Set<string>([target.id]);
  const chosen: Odu[] = [];
  for (const o of order) {
    if (chosen.length >= CHOICE_COUNT - 1) break;
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    chosen.push(o);
  }
  return chosen;
}

/** The answer plus distractors, shuffled. */
export function buildChoices(target: Odu, set: OduSet, rng: Rng): Odu[] {
  return shuffle([target, ...pickDistractors(target, set, rng)], rng);
}
