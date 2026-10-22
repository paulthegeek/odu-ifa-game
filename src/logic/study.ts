import { ESE_ENTRIES, type EseEntry } from '../data/ese';

/** The entries that may be shown for an Odù: reviewed ones only. */
export function getStudyEntries(oduId: string, entries: readonly EseEntry[] = ESE_ENTRIES): EseEntry[] {
  return entries.filter((e) => e.oduId === oduId && e.reviewed);
}
