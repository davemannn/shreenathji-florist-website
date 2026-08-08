// Synthesized notification sound (Web Audio API oscillators) rather than a
// bundled audio file — no asset to source/license/host, and it's a two-line
// tone generator either way.

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

/**
 * Browsers suspend a freshly-created AudioContext until it's resumed
 * inside a user gesture — call this once from a click/keydown listener
 * early in the admin shell's life so the *first* chime later (fired from
 * a background poll, not a gesture) isn't silently dropped.
 */
export function unlockChimeAudio() {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") void ctx.resume();
}

/** A short two-note "ding" — used when a new order comes in while the admin panel is open. */
export function playOrderChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  for (const [index, freq] of [880, 1318.5].entries()) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = freq;

    const start = now + index * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  }
}
