import { describe, expect, it } from 'vitest';
import { ESE_ENTRIES, type EseEntry } from '../../src/data/ese';
import { getStudyEntries } from '../../src/logic/study';

const reviewed: EseEntry = {
  oduId: 'osa_osa',
  meaning: 'test meaning',
  snippets: [{ yoruba: 'yo', english: 'en', source: 'src' }],
  reviewed: true,
};
const unreviewed: EseEntry = { ...reviewed, reviewed: false };

describe('study content', () => {
  it('shows only reviewed entries', () => {
    expect(getStudyEntries('osa_osa', [reviewed, unreviewed])).toEqual([reviewed]);
    expect(getStudyEntries('osa_osa', [unreviewed])).toEqual([]);
  });

  it('Èjì Ogbè has no example notes, like every other Odù', () => {
    expect(getStudyEntries('ogbe_ogbe')).toEqual([]);
    expect(ESE_ENTRIES.filter((e) => e.oduId === 'ogbe_ogbe')).toHaveLength(1);
  });
});
