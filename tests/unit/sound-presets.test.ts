import { describe, expect, it } from 'vitest';
import { FEEDBACK_MS } from '../../src/data/config';
import { SOUND_PRESETS, SOUND_STYLES, type Cue } from '../../src/data/sounds';
import { cueLength } from '../../src/logic/sound';
import { DEFAULT_SETTINGS } from '../../src/logic/storage';

const byStart = (cue: Cue) => [...cue.notes].sort((a, b) => a.at - b.at);
const highest = (cue: Cue) => Math.max(...cue.notes.map((n) => n.freq));

describe('sound presets', () => {
  it('defaults to soft and has unique labels', () => {
    expect(DEFAULT_SETTINGS.soundStyle).toBe('soft');
    const labels = SOUND_STYLES.map((id) => SOUND_PRESETS[id].label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  describe.each(SOUND_STYLES)('%s', (style) => {
    const { correct, incorrect } = SOUND_PRESETS[style];

    it('ends before the next sign appears', () => {
      expect(cueLength(correct)).toBeLessThanOrEqual(FEEDBACK_MS.correct - 30);
      expect(cueLength(incorrect)).toBeLessThanOrEqual(FEEDBACK_MS.incorrect - 200);
    });

    it('rises when correct and falls (or stays low) when incorrect', () => {
      const up = byStart(correct);
      expect(up.at(-1)!.freq).toBeGreaterThan(up[0]!.freq);
      const down = byStart(incorrect);
      if (down.length > 1) expect(down.at(-1)!.freq).toBeLessThan(down[0]!.freq);
      expect(highest(correct)).toBeGreaterThan(highest(incorrect));
    });

    it('stays in a comfortable range and level', () => {
      for (const cue of [correct, incorrect]) {
        const overtoneGain = cue.overtones.reduce((sum, o) => sum + o.gain, 0);
        for (const n of cue.notes) {
          expect(n.freq).toBeGreaterThanOrEqual(250);
          expect(n.freq).toBeLessThanOrEqual(2000);
          expect(n.gain).toBeGreaterThan(0);
          expect(n.gain * (1 + overtoneGain)).toBeLessThanOrEqual(0.35);
          expect(cue.attack).toBeLessThan(n.dur);
        }
      }
    });
  });
});
