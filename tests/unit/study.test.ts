import { describe, expect, it } from 'vitest';
import type { EseEntry } from '../../src/data/ese';
import { getStudyEntries, isVisibleEntry } from '../../src/logic/study';

const reviewed: EseEntry = {
  oduId: 'osa_osa',
  meaning: 'test meaning',
  snippets: [{ yoruba: 'yo', english: 'en', source: 'src' }],
  reviewed: true,
};
const unreviewed: EseEntry = { ...reviewed, reviewed: false };
const placeholder: EseEntry = { ...reviewed, oduId: 'ogbe_ogbe', reviewed: false, placeholder: true };

describe('study content', () => {
  it('shows only reviewed entries', () => {
    expect(getStudyEntries('osa_osa', [reviewed, unreviewed], false)).toEqual([reviewed]);
    expect(getStudyEntries('osa_osa', [unreviewed], false)).toEqual([]);
  });

  it('never shows the placeholder in production', () => {
    expect(isVisibleEntry(placeholder, false)).toBe(false);
    expect(isVisibleEntry({ ...placeholder, reviewed: true }, false)).toBe(false);
    expect(getStudyEntries('ogbe_ogbe', [placeholder], false)).toEqual([]);
  });
});
