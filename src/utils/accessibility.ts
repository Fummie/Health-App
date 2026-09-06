// Accessibility & Disability Support Utilities

class SpeechService {
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStatusChangeListeners: Set<(speaking: boolean) => void> = new Set();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.isSupported()) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for enhanced clarity
    utterance.pitch = 1.0;
    
    // Pick a natural sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notify(false);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
    this.notify(false);
  }

  public subscribe(cb: (speaking: boolean) => void): () => void {
    this.onStatusChangeListeners.add(cb);
    return () => this.onStatusChangeListeners.delete(cb);
  }

  public setOnStateChange(cb: (speaking: boolean) => void): () => void {
    return this.subscribe(cb);
  }

  private notify(speaking: boolean) {
    this.onStatusChangeListeners.forEach(cb => cb(speaking));
  }
}

export const speechService = new SpeechService();
