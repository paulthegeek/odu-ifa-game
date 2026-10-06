/**
 * Sound-cue presets, synthesised with Web Audio (no audio files, so they work offline).
 *
 * Every preset follows the same rules so correct and incorrect are easy to tell apart:
 * correct rises, sits higher, sounds brighter and is short (it must end before
 * FEEDBACK_MS.correct); incorrect falls (or is one low note), sounds duller, is a little
 * quieter and longer. No buzzers or clashing intervals. tests/unit/sound-presets.test.ts
 * checks these rules.
 */

export type Waveform = 'sine' | 'triangle';

/** An extra sine above each note. `decay` is a fraction of the note's duration (default 1). */
export interface Overtone {
  readonly ratio: number;
  readonly gain: number;
  readonly decay?: number;
}

export interface SoundNote {
  /** Fundamental, Hz. */
  readonly freq: number;
  /** Start, ms from the start of the cue. */
  readonly at: number;
  /** Attack plus decay to silence, ms. */
  readonly dur: number;
  /** Peak level 0–1, before SOUND_VOLUME. */
  readonly gain: number;
}

export interface Cue {
  readonly wave: Waveform;
  /** Linear rise to peak, ms. */
  readonly attack: number;
  readonly overtones: readonly Overtone[];
  readonly notes: readonly SoundNote[];
}

export interface SoundPreset {
  readonly label: string;
  readonly detail: string;
  readonly correct: Cue;
  readonly incorrect: Cue;
}

/** In the order Settings lists them. The default (soft) comes first. */
export const SOUND_STYLES = ['soft', 'chime', 'wood', 'bell', 'pluck'] as const;
export type SoundStyle = (typeof SOUND_STYLES)[number];

/** Master level for all cues. Adjust loudness here, not per note. */
export const SOUND_VOLUME = 0.8;

export const SOUND_PRESETS: Record<SoundStyle, SoundPreset> = {
  // Slow swells with no sharp start: rising major third / falling minor third.
  soft: {
    label: 'Soft',
    detail: 'Muted, with no sharp start',
    correct: {
      wave: 'sine',
      attack: 50,
      overtones: [],
      notes: [
        { freq: 523.25 /* C5 */, at: 0, dur: 300, gain: 0.15 },
        { freq: 659.26 /* E5 */, at: 60, dur: 250, gain: 0.13 },
      ],
    },
    incorrect: {
      wave: 'sine',
      attack: 90,
      overtones: [],
      notes: [
        { freq: 392.0 /* G4 */, at: 0, dur: 520, gain: 0.14 },
        { freq: 329.63 /* E4 */, at: 120, dur: 560, gain: 0.12 },
      ],
    },
  },
  // Rising fifth / falling minor third.
  chime: {
    label: 'Chime',
    detail: 'Clear, soft tones',
    correct: {
      wave: 'sine',
      attack: 5,
      overtones: [{ ratio: 2, gain: 0.12 }],
      notes: [
        { freq: 659.26 /* E5 */, at: 0, dur: 200, gain: 0.2 },
        { freq: 987.77 /* B5 */, at: 80, dur: 220, gain: 0.18 },
      ],
    },
    incorrect: {
      wave: 'sine',
      attack: 8,
      overtones: [{ ratio: 2, gain: 0.08 }],
      notes: [
        { freq: 392.0 /* G4 */, at: 0, dur: 300, gain: 0.16 },
        { freq: 329.63 /* E4 */, at: 150, dur: 420, gain: 0.14 },
      ],
    },
  },
  // Marimba-like (overtones at 4× and 10×): rising triad / two dull knocks falling a fourth.
  wood: {
    label: 'Wood',
    detail: 'Warm, woody taps',
    correct: {
      wave: 'sine',
      attack: 2,
      overtones: [
        { ratio: 4, gain: 0.3, decay: 0.3 },
        { ratio: 10, gain: 0.05, decay: 0.12 },
      ],
      notes: [
        { freq: 523.25 /* C5 */, at: 0, dur: 150, gain: 0.22 },
        { freq: 659.26 /* E5 */, at: 70, dur: 150, gain: 0.2 },
        { freq: 783.99 /* G5 */, at: 140, dur: 170, gain: 0.18 },
      ],
    },
    incorrect: {
      wave: 'sine',
      attack: 2,
      overtones: [{ ratio: 4, gain: 0.18, decay: 0.3 }],
      notes: [
        { freq: 392.0 /* G4 */, at: 0, dur: 220, gain: 0.2 },
        { freq: 293.66 /* D4 */, at: 150, dur: 320, gain: 0.18 },
      ],
    },
  },
  // Bell-like inharmonic overtones: rising major third / one low strike.
  bell: {
    label: 'Bell',
    detail: 'Bright, ringing bells',
    correct: {
      wave: 'sine',
      attack: 2,
      overtones: [
        { ratio: 2.76, gain: 0.3, decay: 0.5 },
        { ratio: 5.4, gain: 0.12, decay: 0.25 },
      ],
      notes: [
        { freq: 880.0 /* A5 */, at: 0, dur: 240, gain: 0.14 },
        { freq: 1108.73 /* C#6 */, at: 70, dur: 240, gain: 0.13 },
      ],
    },
    incorrect: {
      wave: 'sine',
      attack: 3,
      overtones: [{ ratio: 2.76, gain: 0.15, decay: 0.4 }],
      notes: [{ freq: 440.0 /* A4 */, at: 0, dur: 600, gain: 0.16 }],
    },
  },
  // Harp/kalimba-like: octave leap up / soft three-step fall.
  pluck: {
    label: 'Pluck',
    detail: 'Gentle plucked strings',
    correct: {
      wave: 'triangle',
      attack: 3,
      overtones: [{ ratio: 2, gain: 0.2, decay: 0.5 }],
      notes: [
        { freq: 392.0 /* G4 */, at: 0, dur: 170, gain: 0.2 },
        { freq: 783.99 /* G5 */, at: 90, dur: 220, gain: 0.18 },
      ],
    },
    incorrect: {
      wave: 'triangle',
      attack: 4,
      overtones: [{ ratio: 2, gain: 0.1, decay: 0.4 }],
      notes: [
        { freq: 440.0 /* A4 */, at: 0, dur: 240, gain: 0.18 },
        { freq: 392.0 /* G4 */, at: 130, dur: 260, gain: 0.16 },
        { freq: 329.63 /* E4 */, at: 260, dur: 380, gain: 0.15 },
      ],
    },
  },
};
