export class CoordinatorRecoveryPolicy {
  private attempts = 0;

  get attempt() { return this.attempts; }

  reset() { this.attempts = 0; }

  nextDelay(random: () => number = Math.random) {
    this.attempts += 1;
    const backoff = Math.min(6_000, 450 * Math.pow(1.7, this.attempts - 1));
    const jitter = Math.floor(Math.max(0, Math.min(0.999, random())) * 900);
    return Math.round(backoff + jitter);
  }
}

export const coordinatorRecovery = new CoordinatorRecoveryPolicy();
