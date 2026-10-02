import { describe, expect, it } from 'vitest';
import { PRINCIPAL_ODU } from '../../src/data/odu';
import {
  ALL_ODU,
  MEJI_ODU,
  composeName,
  displayName,
  getOdu,
  oduFromMarks,
  searchOdu,
  signText,
  stripDiacritics,
} from '../../src/logic/odu';

/** The table from the build brief, top → bottom. */
const EXPECTED: [string, string][] = [
  ['Ogbè', 'I I I I'],
  ['Ọ̀yẹ̀kú', 'II II II II'],
  ['Ìwòrì', 'II I I II'],
  ['Òdí', 'I II II I'],
  ['Ìrosùn', 'I I II II'],
  ['Ọ̀wọ́nrín', 'II II I I'],
  ['Ọ̀bàrà', 'I II II II'],
  ['Ọ̀kànràn', 'II II II I'],
  ['Ògúndá', 'I I I II'],
  ['Ọ̀sá', 'II I I I'],
  ['Ìká', 'II I II II'],
  ['Òtúrúpọ̀n', 'II II I II'],
  ['Òtúrá', 'I II I I'],
  ['Ìrẹtẹ̀', 'I I II I'],
  ['Ọ̀sẹ́', 'I II I II'],
  ['Òfún', 'II I II I'],
];

const EXPECTED_MEJI = [
  'Èjì Ogbè',
  'Ọ̀yẹ̀kú Méjì',
  'Ìwòrì Méjì',
  'Òdí Méjì',
  'Ìrosùn Méjì',
  'Ọ̀wọ́nrín Méjì',
  'Ọ̀bàrà Méjì',
  'Ọ̀kànràn Méjì',
  'Ògúndá Méjì',
  'Ọ̀sá Méjì',
  'Ìká Méjì',
  'Òtúrúpọ̀n Méjì',
  'Òtúrá Méjì',
  'Ìrẹtẹ̀ Méjì',
  'Ọ̀sẹ́ Méjì',
  'Òfún Méjì',
];

describe('principal Odù', () => {
  it('has the 16 patterns from the table, in order of seniority', () => {
    expect(PRINCIPAL_ODU).toHaveLength(16);
    PRINCIPAL_ODU.forEach((p, i) => {
      const [name, pattern] = EXPECTED[i]!;
      expect(p.name).toBe(name);
      expect(p.seniority).toBe(i + 1);
      expect(p.pattern.map((m) => (m === 1 ? 'I' : 'II')).join(' ')).toBe(pattern);
    });
  });

  it('stores names in NFC so fonts render combined marks consistently', () => {
    for (const p of PRINCIPAL_ODU) expect(p.name).toBe(p.name.normalize('NFC'));
  });

  it('has unique ids and patterns', () => {
    expect(new Set(PRINCIPAL_ODU.map((p) => p.id)).size).toBe(16);
    expect(new Set(PRINCIPAL_ODU.map((p) => p.pattern.join(''))).size).toBe(16);
  });
});

describe('the 256 Odù', () => {
  it('generates exactly 256 unique Odù', () => {
    expect(ALL_ODU).toHaveLength(256);
    expect(new Set(ALL_ODU.map((o) => o.id)).size).toBe(256);
    expect(new Set(ALL_ODU.map((o) => o.name)).size).toBe(256);
    expect(new Set(ALL_ODU.map((o) => o.marks.join(''))).size).toBe(256);
  });

  it('names Ọmọ Odù right leg first', () => {
    const osa = PRINCIPAL_ODU.find((p) => p.id === 'osa')!;
    const irete = PRINCIPAL_ODU.find((p) => p.id === 'irete')!;
    expect(composeName(osa, irete)).toBe('Ọ̀sá Ìrẹtẹ̀');
    expect(composeName(irete, osa)).toBe('Ìrẹtẹ̀ Ọ̀sá');
    const odu = getOdu('osa_irete');
    expect(odu.name).toBe('Ọ̀sá Ìrẹtẹ̀');
    expect(odu.marks).toEqual([...osa.pattern, ...irete.pattern]);
  });

  it('names Ogbè on both legs Èjì Ogbè, and other doubles "<Odù> Méjì"', () => {
    expect(MEJI_ODU.map((o) => o.name)).toEqual(EXPECTED_MEJI);
    expect(getOdu('ogbe_ogbe').name).toBe('Èjì Ogbè');
    expect(getOdu('otura_otura').name).toBe('Òtúrá Méjì');
  });

  it('never repeats the same leg name twice', () => {
    for (const o of ALL_ODU) {
      expect(o.name).not.toBe(`${o.right.name} ${o.right.name}`);
      expect(o.name.split(' ')).toHaveLength(2);
      const [a, b] = o.name.split(' ');
      expect(a).not.toBe(b);
    }
  });

  it('keeps Ogbè Méjì as an alias of Èjì Ogbè, and displays Èjì Ogbè', () => {
    const odu = getOdu('ogbe_ogbe');
    expect(odu.aliases).toContain('Ogbè Méjì');
    expect(displayName(odu, true)).toBe('Èjì Ogbè');
    expect(searchOdu('Ogbe Meji').map((o) => o.id)).toContain('ogbe_ogbe');
  });

  it('looks up an Odù from its marks', () => {
    for (const o of ALL_ODU) expect(oduFromMarks(o.marks)?.id).toBe(o.id);
  });

  it('writes the text version right leg first', () => {
    expect(signText(getOdu('ogunda_osa').marks)).toBe('I I I II | II I I I');
  });
});

describe('diacritics display option', () => {
  it('removes marks on screen only', () => {
    expect(stripDiacritics('Ọ̀sẹ́')).toBe('Ose');
    expect(stripDiacritics('Òtúrúpọ̀n Méjì')).toBe('Oturupon Meji');
    const odu = getOdu('ose_ose');
    expect(displayName(odu, false)).toBe('Ose Meji');
    expect(odu.name).toBe('Ọ̀sẹ́ Méjì');
  });
});
