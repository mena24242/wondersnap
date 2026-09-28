// Sound effects with the Web Audio API — zero assets, everything is synthesised. Kept independent of app
// state: the app calls the event methods (snap, whoosh, boom…) and tick(t, def, formed) once per frame for
// the heartbeat / breathing that must stay in phase with the visuals.
//
// The AudioContext is created lazily on the first enable() (autoplay policies require a user gesture).

export class Sound {
  constructor() {
    this.enabled = false;
    this.ctx = null; this.master = null; this.noiseBuf = null;
    this.beatPhase = 0; this.breathPhase = 0;
    try { this.enabled = localStorage.getItem('ws.sound') === '1'; } catch { /* ignore */ }
  }

  setEnabled(v) {
    this.enabled = !!v;
    try { localStorage.setItem('ws.sound', v ? '1' : '0'); } catch { /* ignore */ }
    if (v) this.ensure(); else this.ctx?.suspend?.();
  }

  /** Create / resume the context. Returns false when Web Audio is unavailable. */
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
        const n = this.ctx.sampleRate * 1.5, buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        this.noiseBuf = buf;
      } catch { this.ctx = null; return false; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return true;
  }

  get ready() { return this.enabled && this.ctx && this.ctx.state === 'running'; }

  // -------------------------------------------------- building blocks
  /** One decaying oscillator: type, start freq -> end freq over dur, peak gain. */
  tone(type, f0, f1, dur, gain = 0.2, when = 0) {
    if (!this.ready) return;
    const c = this.ctx, t0 = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, f0), t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0004, t0 + dur);
    o.connect(g).connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  /** Filtered noise burst: bandpass centre f (Hz), duration, peak gain. */
  noise(f, q, dur, gain = 0.2, when = 0, type = 'bandpass') {
    if (!this.ready || !this.noiseBuf) return;
    const c = this.ctx, t0 = c.currentTime + when;
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; s.loop = true;
    fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0004, t0 + dur);
    s.connect(fl).connect(g).connect(this.master);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }

  // -------------------------------------------------- one-shot events
  snap() { this.noise(3200, 1.2, 0.09, 0.5); this.tone('sine', 1500, 220, 0.25, 0.12, 0.02); }          // finger click + falling chirp
  whoosh() { this.noise(600, 0.7, 0.55, 0.28); this.tone('sine', 90, 330, 0.5, 0.10); }                 // parts assembling
  boom() { this.tone('sine', 160, 36, 0.7, 0.5); this.noise(300, 0.6, 0.5, 0.3); }                      // dissolve
  blip() { this.tone('sine', 660, 990, 0.09, 0.16); }                                                   // next / select model
  pick() { this.tone('triangle', 520, 780, 0.12, 0.14); }                                               // part selected
  pull() { this.noise(1200, 2, 0.2, 0.2); this.tone('sine', 300, 600, 0.18, 0.1); }                     // pinch-pull
  correct() { this.tone('sine', 660, 660, 0.12, 0.2); this.tone('sine', 880, 880, 0.22, 0.2, 0.12); }   // quiz ✅
  wrong() { this.tone('square', 220, 180, 0.28, 0.10); }                                                // quiz ❌
  heartLub() { this.tone('sine', 62, 40, 0.16, 0.55); }
  heartDub() { this.tone('sine', 52, 34, 0.13, 0.4); }
  breathIn() { this.noise(800, 0.4, 1.6, 0.05, 0, 'lowpass'); }

  /**
   * Per-frame: keeps the heartbeat / breathing audio in phase with the visual pulse in app.js
   * (same phase formulas). def = current catalog entry, active = model formed & visible.
   */
  tick(t, def, active) {
    if (!this.ready || !active || !def) return;
    if (def.pulse) {
      const p = ((t * def.pulse.bpm) / 60) % 1;
      if (p < this.beatPhase) this.heartLub();                                  // wrapped: start of the cycle
      if (this.beatPhase < 0.3 && p >= 0.3) this.heartDub();
      this.beatPhase = p;
    } else if (def.breath) {
      const p = (t / def.breath.period) % 1;
      if (p < this.breathPhase) this.breathIn();
      this.breathPhase = p;
    }
  }
}
