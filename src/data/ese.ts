/**
 * Study content: meanings and ẹsẹ Ifá snippets.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * IMPORTANT: every word in this file must come from the project owner or an
 * approved source. Never write, generate, paraphrase or "fill in" ẹsẹ Ifá,
 * translations or meanings. An invented or misattributed ẹsẹ teaches
 * something false.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * How to add content (see README → "Adding ẹsẹ Ifá and meanings"):
 *   1. Find the entry for the Odù (or add one; ids are `<right>_<left>`,
 *      e.g. `osa_irete` for Ọ̀sá Ìrẹtẹ̀ — see `src/data/odu.ts`).
 *   2. Fill in `meaning` and add one or more `snippets`, each with a source.
 *   3. Set `reviewed: true` only after the content has been checked.
 *      Entries with `reviewed: false` are never shown to players.
 */

export interface EseSnippet {
  /** Yoruba text, full orthography. */
  readonly yoruba: string;
  /** English translation. */
  readonly english: string;
  /** e.g. "Book title, p. 42" or "from [teacher/house], oral teaching". */
  readonly source: string;
}

export interface EseEntry {
  readonly oduId: string;
  /** Short meaning or summary in English. */
  readonly meaning: string;
  readonly snippets: readonly EseSnippet[];
  /** Only reviewed entries are shown. */
  readonly reviewed: boolean;
}

/**
 * Entries for the 16 Méjì, in order of seniority, waiting for content.
 * Add Ọmọ Odù entries below them in the same shape.
 */
export const ESE_ENTRIES: readonly EseEntry[] = [
  { oduId: 'ogbe_ogbe', meaning: '', snippets: [], reviewed: false },
  { oduId: 'oyeku_oyeku', meaning: '', snippets: [], reviewed: false },
  { oduId: 'iwori_iwori', meaning: '', snippets: [], reviewed: false },
  { oduId: 'odi_odi', meaning: '', snippets: [], reviewed: false },
  { oduId: 'irosun_irosun', meaning: '', snippets: [], reviewed: false },
  { oduId: 'owonrin_owonrin', meaning: '', snippets: [], reviewed: false },
  { oduId: 'obara_obara', meaning: '', snippets: [], reviewed: false },
  { oduId: 'okanran_okanran', meaning: '', snippets: [], reviewed: false },
  { oduId: 'ogunda_ogunda', meaning: '', snippets: [], reviewed: false },
  { oduId: 'osa_osa', meaning: '', snippets: [], reviewed: false },
  { oduId: 'ika_ika', meaning: '', snippets: [], reviewed: false },
  { oduId: 'oturupon_oturupon', meaning: '', snippets: [], reviewed: false },
  { oduId: 'otura_otura', meaning: '', snippets: [], reviewed: false },
  { oduId: 'irete_irete', meaning: '', snippets: [], reviewed: false },
  { oduId: 'ose_ose', meaning: '', snippets: [], reviewed: false },
  { oduId: 'ofun_ofun', meaning: '', snippets: [], reviewed: false },
];
