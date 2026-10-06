import { describe, expect, it } from 'vitest';
import { parseSettings } from '../../src/logic/storage';

describe('parseSettings: soundStyle', () => {
  it.each([{ soundStyle: 'buzzer' }, { soundStyle: 3 }, {}])('falls back to soft for %j', (raw) => {
    expect(parseSettings(raw).soundStyle).toBe('soft');
  });

  it('keeps a valid style', () => {
    const s = parseSettings({ soundStyle: 'wood', soundCues: true });
    expect(s.soundStyle).toBe('wood');
    expect(s.soundCues).toBe(true);
  });
});
