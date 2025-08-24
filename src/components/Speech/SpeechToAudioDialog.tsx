import React, { useState, useEffect, useRef } from "react";
import useSpeech from "@/hooks/useSpeech";
import { audioStorage } from "@/storage/audioStorage";
import { AudioRecordingDocument } from "@/types/audio";

interface SpeechToAudioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioGenerated: (audioFile: { id: string; name: string; blob: Blob }) => void;
}

const SpeechToAudioDialog: React.FC<SpeechToAudioDialogProps> = ({ isOpen, onClose, onAudioGenerated }) => {
  const { voices, currentVoice, updateConfig, isSupported } = useSpeech(true);

  const [text, setText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(-1);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize selected voice index when voices are loaded
  useEffect(() => {
    if (voices.length > 0 && currentVoice && selectedVoiceIndex === -1) {
      const index = voices.findIndex((voice) => voice.name === currentVoice.name && voice.lang === currentVoice.lang);
      setSelectedVoiceIndex(index);
    }
  }, [voices, currentVoice, selectedVoiceIndex]);

  // Auto-generate filename based on text
  useEffect(() => {
    if (text.trim()) {
      const truncatedText = text
        .trim()
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, "");
      setFileName(`speech_${truncatedText.replace(/\s+/g, "_")}`);
    } else {
      setFileName("");
    }
  }, [text]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
    }
    return cleanupRecording;
  }, [isOpen]);

  const cleanupRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
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
    if (selectedVoiceIndex >= 0 && selectedVoiceIndex < voices.length && text.trim()) {
      setIsTestingVoice(true);
      try {
        const testText = text.trim() || "This is how I will pronounce this text.";
        const selectedVoice = voices[selectedVoiceIndex];

        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onend = () => setIsTestingVoice(false);
        utterance.onerror = () => setIsTestingVoice(false);

        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error testing voice:", error);
        setIsTestingVoice(false);
      }
    }
  };

  const generateAudioFile = async () => {
    if (!text.trim() || !fileName.trim() || selectedVoiceIndex === -1) {
      return;
    }

    setIsGenerating(true);

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const finalFileName = fileName.includes(".") ? fileName : `${fileName}.webm`;

        try {
          // Save to audioStorage
          const audioDoc: Omit<AudioRecordingDocument, "id" | "createdAt" | "updatedAt"> = {
            name: finalFileName,
            blob: audioBlob,
            mimeType: "audio/webm",
            duration: undefined, // Could calculate this if needed
          };

          const id = await audioStorage.addAudioFile(audioDoc);

          // Create compatible audioFile object for callback
          const audioFile = {
            id: id.toString(),
            name: finalFileName,
            blob: audioBlob,
          };

          onAudioGenerated(audioFile);
        } catch (error) {
          console.error("Error saving audio file:", error);
        }

        cleanupRecording();
        resetForm();
      };

      // Start recording
      mediaRecorder.start();

      // Wait a moment for recording to start
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Generate speech
      const selectedVoice = voices[selectedVoiceIndex];
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.voice = selectedVoice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onend = () => {
        // Stop recording after speech ends with a small delay
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }, 500);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error generating audio:", error);
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setText("");
    setFileName("");
    setIsGenerating(false);
    onClose();
  };

  const resetToDefaults = () => {
    setRate(1.0);
    setPitch(1.0);
    setVolume(1.0);
    updateConfig({ rate: 1.0, pitch: 1.0, volume: 1.0 });
  };

  if (!isOpen) return null;

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200">Speech synthesis is not supported in your browser</span>
          </div>
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Generate Speech Audio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Text to Speech</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-vertical min-h-[100px]"
              rows={4}
            />
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter filename (without extension)"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voice</label>
            <div className="flex space-x-2">
              <select
                value={selectedVoiceIndex}
                onChange={handleVoiceChange}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                disabled={selectedVoiceIndex === -1 || isTestingVoice || !text.trim()}
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
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Quiet</span>
                <span>Loud</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4">
            <button onClick={resetToDefaults} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
              Reset to Defaults
            </button>

            <div className="flex space-x-2">
              <button onClick={onClose} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors">
                Cancel
              </button>
              <button
                onClick={generateAudioFile}
                disabled={!text.trim() || !fileName.trim() || selectedVoiceIndex === -1 || isGenerating}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {isGenerating ? "Generating..." : "Generate Audio"}
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="mb-2">
              <strong>How it works:</strong>
            </p>
            <ul className="space-y-1 text-xs">
              <li>• Enter the text you want to convert to speech</li>
              <li>• Select a voice and adjust settings</li>
              <li>• Click "Generate Audio" to record the speech through your microphone</li>
              <li>• The browser will ask for microphone permission</li>
              <li>• Make sure your speakers are on and close to the microphone</li>
              <li>• The audio file will be automatically saved to your library</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToAudioDialog;
