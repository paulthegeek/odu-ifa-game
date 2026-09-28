/**
 * Builds the 256 Odù from the 16 principal Odù and owns the naming rule.
 * Every name shown anywhere in the app must come from `composeName`.
 */
import {
  EJI_OGBE,
  MEJI,
  ODU_ALIASES,
  PRINCIPAL_ODU,
  type LegPattern,
  type Mark,
  type PrincipalOdu,
} from '../data/odu';

export interface Odu {
  /** `<right>_<left>`, e.g. `osa_irete`. */
  readonly id: string;
  readonly name: string;
  readonly nameNoDiacritics: string;
  readonly right: PrincipalOdu;
  readonly left: PrincipalOdu;
  readonly aliases: readonly string[];
  /** True when both legs are the same principal Odù. */
  readonly isMeji: boolean;
  /** Right leg then left leg, each top → bottom (8 marks). */
  readonly marks: readonly Mark[];
}

/** Remove tone marks and underdots for display only (Ọ̀ṣẹ́ → Ose). */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
}

/**
 * The single naming rule for a full sign.
 * - Ogbè on both legs → Èjì Ogbè
 * - Any other principal Odù on both legs → "<Odù> Méjì"
 * - Different legs → "<right> <left>" (right leg is read first)
 */
export function composeName(right: PrincipalOdu, left: PrincipalOdu): string {
  if (right.id === left.id) {
    return right.id === 'ogbe' ? EJI_OGBE : `${right.name} ${MEJI}`;
  }
  return `${right.name} ${left.name}`;
}

export const oduId = (rightId: string, leftId: string): string => `${rightId}_${leftId}`;

function buildAll(): Odu[] {
  const all: Odu[] = [];
  for (const right of PRINCIPAL_ODU) {
    for (const left of PRINCIPAL_ODU) {
      const id = oduId(right.id, left.id);
      const name = composeName(right, left);
      all.push({
        id,
        name,
        nameNoDiacritics: stripDiacritics(name),
        right,
        left,
        aliases: ODU_ALIASES[id] ?? [],
        isMeji: right.id === left.id,
        marks: [...right.pattern, ...left.pattern],
      });
    }
  }
  return all;
}

/** All 256 Odù: grouped by right leg in seniority order, then left leg. */
export const ALL_ODU: readonly Odu[] = buildAll();

/** The 16 Méjì (principal Odù on both legs), in order of seniority. */
export const MEJI_ODU: readonly Odu[] = ALL_ODU.filter((o) => o.isMeji);

const byId = new Map(ALL_ODU.map((o) => [o.id, o]));
const byPattern = new Map(ALL_ODU.map((o) => [o.marks.join(''), o]));
const principalByPattern = new Map(PRINCIPAL_ODU.map((p) => [p.pattern.join(''), p]));

export function getOdu(id: string): Odu {
  const odu = byId.get(id);
  if (!odu) throw new Error(`Unknown Odù id: ${id}`);
  return odu;
}

export function findOdu(id: string): Odu | undefined {
  return byId.get(id);
}

/** Look up the Odù for 8 marks (right leg then left leg). */
export function oduFromMarks(marks: readonly Mark[]): Odu | undefined {
  return byPattern.get(marks.join(''));
}

export function principalFromPattern(pattern: readonly Mark[]): PrincipalOdu | undefined {
  return principalByPattern.get(pattern.join(''));
}

export function displayName(odu: Odu, showDiacritics: boolean): string {
  return showDiacritics ? odu.name : odu.nameNoDiacritics;
}

export function displayText(text: string, showDiacritics: boolean): string {
  return showDiacritics ? text : stripDiacritics(text);
}

const markText = (m: Mark) => (m === 1 ? 'I' : 'II');

/** Text version of a leg, e.g. `I I I II`. */
export function legText(pattern: readonly Mark[]): string {
  return pattern.map(markText).join(' ');
}

/** Text version of a sign, right leg first: `I I I II | II I I I`. */
export function signText(marks: readonly Mark[]): string {
  return `${legText(marks.slice(0, 4))} | ${legText(marks.slice(4, 8))}`;
}

/** Search by name, alias or alternate leg spelling, with or without diacritics. */
export function searchOdu(query: string, pool: readonly Odu[] = ALL_ODU): Odu[] {
  const q = stripDiacritics(query).toLowerCase().trim();
  if (!q) return [...pool];
  return pool.filter((o) => {
    const legAlts = [...o.right.altSpellings, ...o.left.altSpellings];
    return [o.name, ...o.aliases, ...legAlts].some((n) => stripDiacritics(n).toLowerCase().includes(q));
  });
}

export type { LegPattern, Mark, PrincipalOdu };
