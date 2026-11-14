class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, volume = 0.08) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playCorrect() {
    this.playTone(523.25, 0.14, 'triangle', 0, 0.08);
    this.playTone(659.25, 0.18, 'triangle', 0.09, 0.09);
  }

  public playTryAgain() {
    this.playTone(293.66, 0.16, 'sine', 0, 0.06);
    this.playTone(261.63, 0.2, 'sine', 0.11, 0.05);
  }

  public playSwitch() {
    this.playTone(440, 0.09, 'sine', 0, 0.05);
  }

  public playUnlock() {
    this.playTone(523.25, 0.16, 'triangle', 0, 0.09);
    this.playTone(659.25, 0.16, 'triangle', 0.1, 0.09);
    this.playTone(783.99, 0.18, 'triangle', 0.2, 0.1);
    this.playTone(1046.5, 0.34, 'triangle', 0.3, 0.1);
  }
}

export const soundFx = new SoundEffectsEngine();
