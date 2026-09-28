/** Soft sound cues (off by default). Fails silently where audio isn't available. */
let ctx: AudioContext | null = null;

function tone(freq: number, ms: number, volume: number): void {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + ms / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.02);
  } catch {
    // No audio: cues are optional.
  }
}

export function playCue(kind: 'correct' | 'incorrect'): void {
  if (kind === 'correct') tone(660, 160, 0.12);
  else tone(330, 220, 0.1);
}
