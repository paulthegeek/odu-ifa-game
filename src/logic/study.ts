import { ESE_ENTRIES, type EseEntry } from '../data/ese';

/**
 * Whether an entry may be shown. Reviewed, non-placeholder entries are always
 * shown; the placeholder only in development so the card layout can be checked.
 */
export function isVisibleEntry(entry: EseEntry, isDev: boolean): boolean {
  if (entry.placeholder) return isDev;
  return entry.reviewed;
}

export function getStudyEntries(
  oduId: string,
  entries: readonly EseEntry[] = ESE_ENTRIES,
  isDev: boolean = import.meta.env.DEV,
): EseEntry[] {
  return entries.filter((e) => e.oduId === oduId && isVisibleEntry(e, isDev));
}
