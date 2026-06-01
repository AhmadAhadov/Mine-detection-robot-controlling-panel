let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.4) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

function repeatBeep(freq: number, interval: number, count: number, type: OscillatorType = 'sine') {
  for (let i = 0; i < count; i++) {
    setTimeout(() => beep(freq, 0.15, type, 0.5), i * interval);
  }
}

export const AudioAlerts = {
  setMuted(val: boolean) { muted = val; },
  isMuted() { return muted; },

  mineDetected() {
    // Urgent ascending beeps
    beep(880, 0.1, 'square', 0.6);
    setTimeout(() => beep(1100, 0.1, 'square', 0.6), 150);
    setTimeout(() => beep(1320, 0.2, 'square', 0.7), 300);
    setTimeout(() => repeatBeep(880, 200, 3, 'square'), 600);
  },

  batteryLow() {
    repeatBeep(440, 400, 4, 'sine');
  },

  tipOverWarning() {
    repeatBeep(660, 200, 6, 'sawtooth');
  },

  signalLost() {
    beep(330, 0.3, 'sine');
    setTimeout(() => beep(220, 0.5, 'sine'), 350);
  },

  eStop() {
    // Long continuous tone
    if (muted) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.0);
    } catch (_) {}
  },
};
