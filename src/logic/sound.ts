/** Soft sound cues (off by default). Fails silently where audio isn't available. */
import { SOUND_PRESETS, SOUND_VOLUME, type Cue, type SoundStyle } from '../data/sounds';

export type CueKind = 'correct' | 'incorrect';

/** Pure: ms from the start of a cue until its last note or overtone is silent. */
export function cueLength(cue: Cue): number {
  const longest = Math.max(1, ...cue.overtones.map((o) => o.decay ?? 1));
  return Math.max(...cue.notes.map((n) => n.at + n.dur * longest));
}

interface Voice {
  osc: OscillatorNode;
  gain: GainNode;
}

let ctx: AudioContext | null = null;
let output: AudioNode | null = null;
const voices = new Set<Voice>();

function context(): { ctx: AudioContext; output: AudioNode } | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx || !output) {
    ctx = new AudioContext({ latencyHint: 'interactive' });
    const master = ctx.createGain();
    master.gain.value = SOUND_VOLUME;
    // A safety limiter, so overlapping overtones never clip.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.1;
    master.connect(limiter).connect(ctx.destination);
    output = master;
  }
  // iOS starts the context suspended; it may only resume during a user gesture.
  if (ctx.state !== 'running') void ctx.resume().catch(() => {});
  return { ctx, output };
}

function voice(
  ac: AudioContext,
  out: AudioNode,
  wave: OscillatorType,
  freq: number,
  peak: number,
  start: number,
  attack: number,
  end: number,
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(gain).connect(out);
  const v = { osc, gain };
  voices.add(v);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
    voices.delete(v);
  };
  osc.start(start);
  osc.stop(end + 0.02);
}

/** Fade out anything still ringing, e.g. when a preview button is pressed repeatedly. */
function silence(ac: AudioContext): void {
  const now = ac.currentTime;
  for (const { osc, gain } of voices) {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.setTargetAtTime(0, now, 0.01);
      osc.stop(now + 0.06);
    } catch {
      // Already stopped.
    }
  }
}

export function playCue(kind: CueKind, style: SoundStyle): void {
  try {
    const audio = context();
    if (!audio) return;
    const { ctx: ac, output: out } = audio;
    silence(ac);
    const cue = SOUND_PRESETS[style][kind];
    const t0 = ac.currentTime + 0.01;
    const attack = cue.attack / 1000;
    const nyquist = ac.sampleRate / 2;
    for (const n of cue.notes) {
      const start = t0 + n.at / 1000;
      const dur = n.dur / 1000;
      voice(ac, out, cue.wave, n.freq, n.gain, start, attack, start + dur);
      for (const o of cue.overtones) {
        const freq = n.freq * o.ratio;
        if (freq >= nyquist) continue;
        const end = start + Math.max(dur * (o.decay ?? 1), attack + 0.01);
        voice(ac, out, 'sine', freq, n.gain * o.gain, start, attack, end);
      }
    }
  } catch {
    // No audio: cues are optional.
  }
}
