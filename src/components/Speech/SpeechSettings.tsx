import React, { useState, useEffect } from "react";
import useSpeech from "@/hooks/useSpeech";

interface SpeechSettingsProps {
  className?: string;
  initialEnabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
}

const SpeechSettings: React.FC<SpeechSettingsProps> = ({ className = "", initialEnabled = true, onEnabledChange }) => {
  const { voices, currentVoice, updateConfig, testVoice, isSupported, isSpeaking, isEnabled, setIsEnabled } = useSpeech(initialEnabled);

  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(-1);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);

  // Initialize selected voice index when voices are loaded
  useEffect(() => {
    if (voices.length > 0 && currentVoice && selectedVoiceIndex === -1) {
      const index = voices.findIndex((voice) => voice.name === currentVoice.name && voice.lang === currentVoice.lang);
      setSelectedVoiceIndex(index);
    }
  }, [voices, currentVoice, selectedVoiceIndex]);

  // Notify parent of enabled state changes
  useEffect(() => {
    onEnabledChange?.(isEnabled);
  }, [isEnabled, onEnabledChange]);

  const handleToggleAudio = () => {
    setIsEnabled(!isEnabled);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    setSelectedVoiceIndex(index);

    if (index >= 0 && index < voices.length) {
      const selectedVoice = voices[index];
      updateConfig({ voice: selectedVoice });
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    updateConfig({ rate: newRate });
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(newPitch);
    updateConfig({ pitch: newPitch });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    updateConfig({ volume: newVolume });
  };

  const handleTestVoice = async () => {
    if (selectedVoiceIndex >= 0 && selectedVoiceIndex < voices.length) {
      setIsTestingVoice(true);
      try {
        await testVoice(voices[selectedVoiceIndex], "This is how I will pronounce words.");
      } catch (error) {
        console.error("Error testing voice:", error);
      } finally {
        setIsTestingVoice(false);
      }
    }
  };

  const resetToDefaults = () => {
    setRate(1.0);
    setPitch(1.0);
    setVolume(1.0);
    updateConfig({ rate: 1.0, pitch: 1.0, volume: 1.0 });
  };

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-yellow-800">Speech synthesis is not supported in your browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Audio Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Speech Audio</label>
        <button
          onClick={handleToggleAudio}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* Voice Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voice</label>
        <div className="flex space-x-2">
          <select
            value={selectedVoiceIndex}
            onChange={handleVoiceChange}
            disabled={!isEnabled}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={-1}>Select a voice</option>
            {voices.map((voice, index) => (
              <option key={`${voice.name}-${voice.lang}`} value={index}>
                {voice.name} ({voice.lang}) {voice.default ? "(Default)" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={handleTestVoice}
            disabled={!isEnabled || selectedVoiceIndex === -1 || isTestingVoice || isSpeaking}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {isTestingVoice ? "Testing..." : "Test"}
          </button>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rate */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Speed: {rate.toFixed(1)}x</label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={handleRateChange}
            disabled={!isEnabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pitch: {pitch.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
            disabled={!isEnabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Volume: {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!isEnabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          onClick={resetToDefaults}
          disabled={!isEnabled}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
        <p className="mb-2">
          <strong>Speech Settings:</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>
            • <strong>Speed:</strong> How fast words are spoken
          </li>
          <li>
            • <strong>Pitch:</strong> How high or low the voice sounds
          </li>
          <li>
            • <strong>Volume:</strong> How loud the speech is
          </li>
          <li>• Use "Test" to preview how words will sound with the selected voice</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechSettings;
