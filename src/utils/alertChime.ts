/**
 * Clinical Audio Alert Chime using Web Audio API
 * Generates an authoritative, professional medical telemetry pulse sound
 */

class AlertAudioService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private intervalId: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public playAlarmPulse(critical: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sound profile: Medical frequency pulse (880Hz / 660Hz dual pulse)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(critical ? 920 : 740, now);
    osc.frequency.exponentialRampToValueAtTime(critical ? 680 : 580, now + 0.18);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);

    // Second chime pulse
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const delay = 0.22;

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(critical ? 1040 : 840, now + delay);
    osc2.frequency.exponentialRampToValueAtTime(critical ? 780 : 660, now + delay + 0.2);

    gain2.gain.setValueAtTime(0, now + delay);
    gain2.gain.linearRampToValueAtTime(0.3, now + delay + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.32);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + delay);
    osc2.stop(now + delay + 0.35);
  }

  public startContinuousAlert(critical: boolean = true) {
    this.stopContinuousAlert();
    this.playAlarmPulse(critical);
    this.intervalId = setInterval(() => {
      this.playAlarmPulse(critical);
    }, critical ? 2800 : 4500);
  }

  public stopContinuousAlert() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopContinuousAlert();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const alertAudioService = new AlertAudioService();
