import React, { useEffect, useState, useRef } from "react";
import AudioFilesList from "../components/Recorder/AudioFilesList";
import SpectrumAnalyzer from "../components/Recorder/SpectrumAnalyzer";
import { audioStorage } from "../storage/audioStorage";
import { AudioRecordingDocument } from "../types/audio";
import { useTonePlaybackWithStats } from "../hooks/useTonePlaybackWithStats";
import ShinFileInput from "../components/shinui/ShinFileInput";

// File upload helper
function blobFromFile(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(new Blob([reader.result as ArrayBuffer], { type: file.type }));
    };
    reader.readAsArrayBuffer(file);
  });
}

const AudioFilesPage: React.FC = () => {
  const [files, setFiles] = useState<AudioRecordingDocument[]>([]);
  const [playingFile, setPlayingFile] = useState<AudioRecordingDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { play, frequencyStats } = useTonePlaybackWithStats();

  // Initial load
  useEffect(() => {
    audioStorage.getAudioFiles().then((data) => setFiles(data.reverse()));
  }, []);

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const blob = await blobFromFile(file);
    // Try to get duration
    let duration: number | undefined;
    try {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(blob);
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => resolve();
      });
      duration = audio.duration;
    } catch {}
    await audioStorage.addAudioFile({
      name: file.name,
      blob,
      mimeType: file.type,
      duration,
    });
    const allFiles = await audioStorage.getAudioFiles();
    setFiles(allFiles.reverse());
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle delete
  const handleDelete = async (file: AudioRecordingDocument) => {
    if (!window.confirm(`Delete "${file.name}"?`)) return;
    await audioStorage.deleteAudioFile(Number(file.id));
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    if (playingFile?.id === file.id) setPlayingFile(null);
  };

  // Handle edit (just rename for demo)
  const handleEdit = async (file: AudioRecordingDocument) => {
    const newName = prompt("Rename file:", file.name);
    if (!newName || newName === file.name) return;
    await audioStorage.updateAudioFile({ ...file, name: newName });
    const allFiles = await audioStorage.getAudioFiles();
    setFiles(allFiles.reverse());
  };

  // <div className="w-full max-w-2xl p-4 space-y-4 bg-muted/50 dark:bg-muted/70 rounded-lg shadow">
  return (
    <div className="flex flex-col min-h-screen w-full max-w-lg mx-auto p-3 dark:text-white p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Audio Files</h1>
      <div className="flex items-center gap-3 mb-4">
        <ShinFileInput onChange={handleUpload} disabled={isUploading} accept="audio/*" inputRef={fileInputRef} />
        {isUploading && <span className="text-blue-600 dark:text-blue-300 animate-pulse">Uploading...</span>}
      </div>
      {showAnalyzer && playingFile && frequencyStats && (
        <div className="my-2">
          <SpectrumAnalyzer frequencyStats={frequencyStats} />
        </div>
      )}
      <AudioFilesList
        files={files}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pageSize={15}
        onPlay={(file) => {
          setPlayingFile(file);
          play(file.blob);
          setShowAnalyzer(true);
        }}
      />
    </div>
  );
};

export default AudioFilesPage;
