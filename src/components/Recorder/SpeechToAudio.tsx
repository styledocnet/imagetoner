import React, { useState, useEffect } from "react";
import SpeechToAudioDialog from "../Speech/SpeechToAudioDialog";
import ShinButton from "../shinui/ShinButton";
import { AudioRecordingDocument } from "../../types/audio";

interface SpeechToAudioProps {
  onAddFile?: (audioFile: AudioRecordingDocument) => void;
  onPlay?: (audioFile: AudioRecordingDocument) => void;
}

const SpeechToAudio: React.FC<SpeechToAudioProps> = ({ onAddFile, onPlay }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // Check Web Speech API support
  useEffect(() => {
    const isSupported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setIsSpeechSupported(isSupported);
  }, []);

  const handleSpeechGenerated = (audioFile: { id: string; name: string; blob: Blob }) => {
    // Fill in missing fields for AudioRecordingDocument
    const now = new Date().toISOString();
    const audioDoc: AudioRecordingDocument = {
      id: Number(audioFile.id),
      name: audioFile.name,
      blob: audioFile.blob,
      mimeType: "audio/webm", // or whatever is appropriate
      createdAt: now,
      updatedAt: now,
      duration: undefined,
    };

    onAddFile?.(audioDoc);
    onPlay?.(audioDoc);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (!isSpeechSupported) {
    return null;
  }

  return (
    <>
      <ShinButton
        onClick={handleOpenDialog}
        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 active:bg-purple-800 text-sm flex items-center"
        aria-label="Generate Speech Audio"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
          />
        </svg>
        Speech
      </ShinButton>
      <SpeechToAudioDialog isOpen={isDialogOpen} onClose={handleCloseDialog} onAudioGenerated={handleSpeechGenerated} />
    </>
  );
};

export default SpeechToAudio;
