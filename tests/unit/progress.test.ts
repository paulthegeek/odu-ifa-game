import { describe, expect, it } from 'vitest';
import {
  currentStreak,
  emptyProgress,
  mixUps,
  oduStats,
  overview,
  recordRound,
  rollUp,
  weakWeights,
  weakestOdu,
  type AnswerRecord,
  type ProgressData,
  type RoundRecord,
} from '../../src/logic/progress';
import { exportProgress, openProgressStore, parseImport } from '../../src/logic/progressStore';

let n = 0;
function answer(
  oduId: string,
  givenId: string,
  responseMs = 1000,
  extra: Partial<AnswerRecord> = {},
): AnswerRecord {
  n += 1;
  return {
    id: `a${n}`,
    roundId: 'r1',
    oduId,
    givenId,
    correct: oduId === givenId,
    mode: 'opele',
    direction: 'read',
    responseMs,
    ts: n,
    timed: true,
    ...extra,
  };
}

function round(ts: number, extra: Partial<RoundRecord> = {}): RoundRecord {
  return {
    id: `r${ts}`,
    mode: 'opele',
    direction: 'read',
    set: 'all',
    length: 60,
    timing: 'standard',
    practice: false,
    score: 5,
    attempted: 7,
    ts,
    ...extra,
  };
}

const withAnswers = (answers: AnswerRecord[]): ProgressData => ({ ...emptyProgress(), answers });

describe('accuracy and weakest Odù', () => {
  it('computes per-Odù accuracy', () => {
    const data = withAnswers([
      answer('osa_irete', 'osa_irete'),
      answer('osa_irete', 'irete_osa'),
      answer('ogbe_ogbe', 'ogbe_ogbe'),
    ]);
    const stats = oduStats(data);
    expect(stats.get('osa_irete')).toMatchObject({ attempts: 2, correct: 1, accuracy: 0.5 });
    expect(stats.get('ogbe_ogbe')).toMatchObject({ attempts: 1, accuracy: 1 });
  });

  it('ranks weakest by accuracy, needs 3 attempts, and breaks ties by slower response', () => {
    const data = withAnswers([
      // 2 attempts, 0% — excluded by the 3-attempt minimum
      answer('ika_ika', 'ika_osa'),
      answer('ika_ika', 'ika_osa'),
      // 3 attempts, 33%, fast
      answer('osa_osa', 'osa_osa', 500),
      answer('osa_osa', 'ofun_osa', 500),
      answer('osa_osa', 'ofun_osa', 500),
      // 3 attempts, 33%, slow
      answer('odi_odi', 'odi_odi', 3000),
      answer('odi_odi', 'odi_iwori', 3000),
      answer('odi_odi', 'odi_iwori', 3000),
      // 3 attempts, 100%
      answer('ogbe_ogbe', 'ogbe_ogbe'),
      answer('ogbe_ogbe', 'ogbe_ogbe'),
      answer('ogbe_ogbe', 'ogbe_ogbe'),
    ]);
    const weakest = weakestOdu(oduStats(data));
    expect(weakest.map((s) => s.oduId)).toEqual(['odi_odi', 'osa_osa', 'ogbe_ogbe']);
  });

  it('filters stats by mode and direction', () => {
    const data = withAnswers([
      answer('osa_osa', 'osa_osa', 1000, { mode: 'opon' }),
      answer('osa_osa', 'ika_osa', 1000, { direction: 'build' }),
    ]);
    expect(oduStats(data, { mode: 'opon' }).get('osa_osa')?.attempts).toBe(1);
    expect(oduStats(data, { direction: 'build' }).get('osa_osa')?.accuracy).toBe(0);
  });
});

describe('mix-ups', () => {
  it('counts pairs most often confused', () => {
    const data = withAnswers([
      answer('osa_irete', 'irete_osa'),
      answer('osa_irete', 'irete_osa'),
      answer('osa_irete', 'irete_osa'),
      answer('osa_irete', 'irete_osa'),
      answer('ika_ika', 'oturupon_oturupon'),
      answer('ogbe_ogbe', 'ogbe_ogbe'),
    ]);
    expect(mixUps(data)).toEqual([
      { targetId: 'osa_irete', givenId: 'irete_osa', count: 4 },
      { targetId: 'ika_ika', givenId: 'oturupon_oturupon', count: 1 },
    ]);
  });
});

describe('roll-up', () => {
  it('keeps the most recent answers and rolls older ones into totals without losing accuracy', () => {
    const answers = [
      answer('osa_irete', 'irete_osa', 2000),
      answer('osa_irete', 'osa_irete', 1000),
      answer('ogbe_ogbe', 'ogbe_ogbe', 500),
      answer('osa_irete', 'irete_osa', 3000),
    ];
    const before = withAnswers(answers);
    const after = rollUp(before, 2);
    expect(after.answers.map((a) => a.id)).toEqual(answers.slice(2).map((a) => a.id));
    expect(oduStats(after)).toEqual(oduStats(before));
    expect(mixUps(after)).toEqual(mixUps(before));
    expect(overview(after, 0).answers).toBe(4);
  });

  it('rolls up when recording a round beyond the limit', () => {
    const data = recordRound(
      emptyProgress(),
      round(1),
      [answer('osa_osa', 'osa_osa'), answer('ika_ika', 'ika_ika')],
      1,
    );
    expect(data.answers).toHaveLength(1);
    expect(overview(data, 1).answers).toBe(2);
  });
});

describe('streak', () => {
  const day = (d: number, h = 12) => new Date(2026, 0, d, h).getTime();
  it('counts consecutive days ending today or yesterday', () => {
    const rounds = [round(day(1)), round(day(3)), round(day(4, 8)), round(day(4, 20)), round(day(5))];
    expect(currentStreak(rounds, day(5, 22))).toBe(3);
    expect(currentStreak(rounds, day(6, 9))).toBe(3);
    expect(currentStreak(rounds, day(7, 9))).toBe(0);
  });
});

describe('weak weighting', () => {
  it('weights low accuracy and slow answers higher, but keeps strong ones in the mix', () => {
    const data = withAnswers([
      answer('osa_osa', 'ika_osa', 4000),
      answer('osa_osa', 'ika_osa', 4000),
      answer('ogbe_ogbe', 'ogbe_ogbe', 500),
      answer('ogbe_ogbe', 'ogbe_ogbe', 500),
    ]);
    const [weak, strong] = weakWeights(['osa_osa', 'ogbe_ogbe'], oduStats(data));
    expect(weak!).toBeGreaterThan(strong!);
    expect(strong!).toBeGreaterThan(0);
  });
});

describe('export and import', () => {
  it('round-trips without data loss', () => {
    const data = rollUp(
      recordRound(emptyProgress(), round(10), [
        answer('osa_irete', 'irete_osa'),
        answer('ogbe_ogbe', 'ogbe_ogbe'),
        answer('ika_ika', 'ika_ika', 1200, { mode: 'opon', direction: 'build', timed: false }),
      ]),
      1,
    );
    const result = parseImport(exportProgress(data));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(data);
  });

  it('rejects bad files with a clear message', () => {
    const notJson = parseImport('not json');
    expect(notJson.ok).toBe(false);
    if (!notJson.ok) expect(notJson.error).toContain('not valid JSON');
    expect(parseImport('{"format":"something-else","version":1}').ok).toBe(false);
    const bad = JSON.parse(exportProgress(withAnswers([answer('osa_osa', 'osa_osa')]))) as {
      answers: unknown[];
    };
    bad.answers.push({ oduId: 'not_an_odu' });
    const r = parseImport(JSON.stringify(bad));
    expect(r).toEqual({ ok: false, error: 'Answer 2 in the file is not valid.' });
  });

  it('persists to IndexedDB', async () => {
    const store = await openProgressStore();
    expect(store.persistent).toBe(true);
    const data = recordRound(emptyProgress(), round(1), [answer('osa_osa', 'osa_osa')]);
    await store.save(data);
    expect(await store.load()).toEqual(data);
    await store.clear();
    expect((await store.load()).answers).toHaveLength(0);
  });
});
