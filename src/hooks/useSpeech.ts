import { useCallback, useEffect, useState } from "react";
import speechService, { type SpeechConfig } from "@/services/speechService";

export interface UseSpeechReturn {
  speak: (text: string) => Promise<void>;
  speakQueued: (text: string) => Promise<void>;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  updateConfig: (config: Partial<SpeechConfig>) => void;
  testVoice: (voice: SpeechSynthesisVoice, testText?: string) => Promise<void>;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

const useSpeech = (initialEnabled: boolean = true): UseSpeechReturn => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Check if speech synthesis is supported
  const isSupported = speechService.isSupported();

  // Update speech service enabled state when local enabled state changes
  useEffect(() => {
    speechService.updateConfig({ enabled: isEnabled });
  }, [isEnabled]);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechService.getVoices();
      setVoices(availableVoices);

      // Set default voice if none is set
      if (availableVoices.length > 0 && !currentVoice) {
        const defaultVoice = availableVoices.find((voice) => voice.default) || availableVoices[0];
        setCurrentVoice(defaultVoice);
        speechService.updateConfig({ voice: defaultVoice });
      }
    };

    // Initial load
    loadVoices();

    // Listen for voices change (some browsers load voices async)
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.addEventListener("voiceschanged", loadVoices);

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, [isSupported, currentVoice]);

  // Monitor speaking state
  useEffect(() => {
    if (!isSupported) return;

    const checkSpeakingState = () => {
      setIsSpeaking(speechService.isSpeaking());
    };

    const interval = setInterval(checkSpeakingState, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isSupported]);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!isEnabled || !text.trim()) {
        return Promise.resolve();
      }

      try {
        await speechService.speak(text);
      } catch (error) {
        console.error("Speech error:", error);
        // Don't throw to avoid breaking flow
      }
    },
    [isEnabled],
  );

  const speakQueued = useCallback(
    async (text: string): Promise<void> => {
      if (!isEnabled || !text.trim()) {
        return Promise.resolve();
      }

      try {
        await speechService.speakQueued(text);
      } catch (error) {
        console.error("Queued speech error:", error);
      }
    },
    [isEnabled],
  );

  const cancel = useCallback(() => {
    speechService.cancel();
  }, []);

  const pause = useCallback(() => {
    speechService.pause();
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
  }, []);

  const updateConfig = useCallback((config: Partial<SpeechConfig>) => {
    speechService.updateConfig(config);

    // Update local state if voice changed
    if (config.voice) {
      setCurrentVoice(config.voice);
    }
  }, []);

  const testVoice = useCallback(async (voice: SpeechSynthesisVoice, testText?: string): Promise<void> => {
    try {
      await speechService.testVoice(voice, testText);
    } catch (error) {
      console.error("Voice test error:", error);
    }
  }, []);

  return {
    speak,
    speakQueued,
    cancel,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
    currentVoice,
    updateConfig,
    testVoice,
    isEnabled,
    setIsEnabled,
  };
};

export default useSpeech;
