/**
 * Odù data — the editable source of truth.
 *
 * Spellings follow standard Yoruba orthography (Ìṣẹ̀ṣẹ). Do not simplify,
 * re-spell, or replace with Lucumí / Spanish / Portuguese forms.
 *
 * Marks: 1 = single mark (I), 2 = double mark (II).
 * Patterns are read top → bottom.
 *
 * The full 256 are generated from these 16 in `src/logic/odu.ts`.
 * To correct a name or pattern, edit it here; no game logic needs to change.
 */

export type Mark = 1 | 2;
export type LegPattern = readonly [Mark, Mark, Mark, Mark];

export interface PrincipalOdu {
  /** Stable id used in saved progress. Never change an existing id. */
  readonly id: string;
  /** Leg name with full diacritics. */
  readonly name: string;
  /** Position in traditional Nigerian order of seniority (1–16). */
  readonly seniority: number;
  readonly pattern: LegPattern;
  /** Other accepted spellings of the leg name (search only). */
  readonly altSpellings: readonly string[];
}

/** The 16 Ojú Odù, in traditional Nigerian order of seniority. */
export const PRINCIPAL_ODU: readonly PrincipalOdu[] = [
  { id: 'ogbe', name: 'Ogbè', seniority: 1, pattern: [1, 1, 1, 1], altSpellings: [] },
  { id: 'oyeku', name: 'Ọ̀yẹ̀kú', seniority: 2, pattern: [2, 2, 2, 2], altSpellings: [] },
  { id: 'iwori', name: 'Ìwòrì', seniority: 3, pattern: [2, 1, 1, 2], altSpellings: [] },
  { id: 'odi', name: 'Òdí', seniority: 4, pattern: [1, 2, 2, 1], altSpellings: [] },
  { id: 'irosun', name: 'Ìrosùn', seniority: 5, pattern: [1, 1, 2, 2], altSpellings: [] },
  { id: 'owonrin', name: 'Ọ̀wọ́nrín', seniority: 6, pattern: [2, 2, 1, 1], altSpellings: [] },
  { id: 'obara', name: 'Ọ̀bàrà', seniority: 7, pattern: [1, 2, 2, 2], altSpellings: [] },
  { id: 'okanran', name: 'Ọ̀kànràn', seniority: 8, pattern: [2, 2, 2, 1], altSpellings: [] },
  { id: 'ogunda', name: 'Ògúndá', seniority: 9, pattern: [1, 1, 1, 2], altSpellings: [] },
  { id: 'osa', name: 'Ọ̀sá', seniority: 10, pattern: [2, 1, 1, 1], altSpellings: [] },
  { id: 'ika', name: 'Ìká', seniority: 11, pattern: [2, 1, 2, 2], altSpellings: [] },
  { id: 'oturupon', name: 'Òtúúrúpọ̀n', seniority: 12, pattern: [2, 2, 1, 2], altSpellings: [] },
  { id: 'otura', name: 'Òtúrá', seniority: 13, pattern: [1, 2, 1, 1], altSpellings: ['Òtúá'] },
  { id: 'irete', name: 'Ìrẹtẹ̀', seniority: 14, pattern: [1, 1, 2, 1], altSpellings: [] },
  { id: 'ose', name: 'Ọ̀ṣẹ́', seniority: 15, pattern: [1, 2, 1, 2], altSpellings: [] },
  { id: 'ofun', name: 'Òfún', seniority: 16, pattern: [2, 1, 2, 1], altSpellings: [] },
];

/** Word used for a principal Odù on both legs (e.g. Òtúrá Méjì). */
export const MEJI = 'Méjì';

/** Special name for Ogbè on both legs — the only exception to the Méjì pattern. */
export const EJI_OGBE = 'Èjì Ogbè';

/**
 * Traditional alternate names, keyed by full Odù id (`<right>_<left>`).
 *
 * DO NOT invent aliases. Only add names that are supplied and verified.
 * Aliases are used for search and shown on study cards; the display name
 * always comes from the naming rule in `src/logic/odu.ts`.
 */
export const ODU_ALIASES: Readonly<Record<string, readonly string[]>> = {
  // Stored for search; Èjì Ogbè is always the name displayed.
  ogbe_ogbe: ['Ogbè Méjì'],

  // REVIEW: named as an example in the build brief. Uncomment once verified.
  // ogbe_ogunda: ['Ogbè Yọ̀nú'],
};
