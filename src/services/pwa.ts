interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

class PwaService {
  private promptEvent?: InstallPromptEvent;
  private listeners = new Set<() => void>();

  constructor() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.promptEvent = event as InstallPromptEvent;
      this.emit();
    });
    window.addEventListener("appinstalled", () => {
      this.promptEvent = undefined;
      this.emit();
    });
  }

  get canInstall() { return Boolean(this.promptEvent); }
  get installed() { return window.matchMedia("(display-mode: standalone)").matches; }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    listener();
    return () => this.listeners.delete(listener);
  }

  async install() {
    if (!this.promptEvent) return "unavailable" as const;
    const event = this.promptEvent;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") this.promptEvent = undefined;
    this.emit();
    return choice.outcome;
  }

  private emit() { this.listeners.forEach((listener) => listener()); }
}

export const pwaService = new PwaService();
