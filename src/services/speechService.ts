export interface SpeechConfig {
  enabled: boolean;
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

export interface SpeechServiceInterface {
  speak: (text: string) => Promise<void>;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  getVoices: () => SpeechSynthesisVoice[];
  isSupported: () => boolean;
  isSpeaking: () => boolean;
  updateConfig: (config: Partial<SpeechConfig>) => void;
}

class SpeechService implements SpeechServiceInterface {
  private config: SpeechConfig = {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    language: "en-US",
  };

  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechQueue: string[] = [];
  private isProcessing = false;

  constructor(initialConfig?: Partial<SpeechConfig>) {
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }

    // Handle voices loaded event
    if (this.isSupported()) {
      speechSynthesis.addEventListener("voiceschanged", this.handleVoicesChanged.bind(this));
    }
  }

  private handleVoicesChanged(): void {
    // Auto-select a voice if none is set
    if (!this.config.voice) {
      const voices = this.getVoices();
      const preferredVoice =
        voices.find((voice) => voice.lang.startsWith(this.config.language) && voice.default) ||
        voices.find((voice) => voice.lang.startsWith(this.config.language)) ||
        voices[0];

      if (preferredVoice) {
        this.config.voice = preferredVoice;
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return speechSynthesis.getVoices();
  }

  public isSpeaking(): boolean {
    if (!this.isSupported()) return false;
    return speechSynthesis.speaking;
  }

  public updateConfig(newConfig: Partial<SpeechConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public async speak(text: string): Promise<void> {
    if (!this.config.enabled || !this.isSupported() || !text.trim()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any current speech
        this.cancel();

        const utterance = new SpeechSynthesisUtterance(text.trim());

        // Apply configuration
        if (this.config.voice) {
          utterance.voice = this.config.voice;
        }
        utterance.rate = this.config.rate;
        utterance.pitch = this.config.pitch;
        utterance.volume = this.config.volume;
        utterance.lang = this.config.language;

        // Set up event handlers
        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event.error);
          this.currentUtterance = null;
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        utterance.onstart = () => {
          console.log("Speech started:", text);
        };

        // Store reference and speak
        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error creating speech utterance:", error);
        reject(error);
      }
    });
  }

  public cancel(): void {
    if (!this.isSupported()) return;

    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
    this.speechQueue = [];
  }

  public pause(): void {
    if (!this.isSupported()) return;
    speechSynthesis.pause();
  }

  public resume(): void {
    if (!this.isSupported()) return;
    speechSynthesis.resume();
  }

  // Queue management for multiple words
  public async speakQueued(text: string): Promise<void> {
    if (!this.config.enabled || !this.isSupported()) {
      return Promise.resolve();
    }

    this.speechQueue.push(text);

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.speechQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    while (this.speechQueue.length > 0) {
      const text = this.speechQueue.shift();
      if (text) {
        try {
          await this.speak(text);
          // Small delay between words
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error("Error speaking queued text:", error);
        }
      }
    }

    this.isProcessing = false;
  }

  public clearQueue(): void {
    this.speechQueue = [];
    this.cancel();
  }

  // Utility method for testing different voices
  public async testVoice(voice: SpeechSynthesisVoice, testText: string = "Hello, this is a voice test."): Promise<void> {
    const originalVoice = this.config.voice;
    this.config.voice = voice;

    try {
      await this.speak(testText);
    } finally {
      this.config.voice = originalVoice;
    }
  }
}

// Create singleton instance
const speechService = new SpeechService();

// Export both the class and singleton for flexibility
export { SpeechService };
export default speechService;
