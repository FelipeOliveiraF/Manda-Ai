export type CallSoundEvent =
  | "join"
  | "leave"
  | "participantJoin"
  | "participantLeave"
  | "shareStart"
  | "shareStop"
  | "mediaOn"
  | "mediaOff";

type Tone = [frequency: number, offset: number, duration: number, volume: number];

const patterns: Record<CallSoundEvent, Tone[]> = {
  join: [[440, 0, .10, .055], [554, .08, .12, .05], [659, .17, .17, .045]],
  leave: [[554, 0, .11, .05], [440, .09, .14, .045], [330, .19, .18, .04]],
  participantJoin: [[523, 0, .08, .038], [659, .07, .12, .033]],
  participantLeave: [[494, 0, .08, .036], [370, .07, .13, .032]],
  shareStart: [[392, 0, .07, .045], [587, .08, .09, .04], [784, .16, .14, .034]],
  shareStop: [[659, 0, .08, .04], [494, .08, .13, .034]],
  mediaOn: [[620, 0, .07, .026]],
  mediaOff: [[390, 0, .07, .024]],
};

class CallSounds {
  private context?: AudioContext;
  private lastPlayed = new Map<CallSoundEvent, number>();

  play(event: CallSoundEvent) {
    const now = performance.now();
    if (now - (this.lastPlayed.get(event) ?? 0) < 260) return;
    this.lastPlayed.set(event, now);
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
      const start = this.context.currentTime + .015;
      for (const [frequency, offset, duration, volume] of patterns[event]) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start + offset);
        gain.gain.setValueAtTime(.0001, start + offset);
        gain.gain.exponentialRampToValueAtTime(volume, start + offset + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, start + offset + duration);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + duration + .02);
      }
    } catch {
      // O navegador pode bloquear áudio antes da primeira interação; a chamada continua normalmente.
    }
  }
}

export const callSounds = new CallSounds();
