import React, { useRef, useEffect, useState, useCallback } from "react";
import ShinButton from "../shinui/ShinButton";
import SlidingAudioVisualizer from "./SlidingAudioVisualizer";
import SpeechToAudio from "./SpeechToAudio";
import { AudioRecordingDocument } from "../../types/audio";
import { useAudioPlaybackWithVisualization } from "@/hooks/useAudioPlaybackWithVisualization";

interface Props {
  files: AudioRecordingDocument[];
  onPlay?: (file: AudioRecordingDocument) => void;
  onEdit?: (file: AudioRecordingDocument) => void;
  onDelete?: (file: AudioRecordingDocument) => void;
  onAddFile?: (file: AudioRecordingDocument) => void;
  pageSize?: number;
  fullMode?: boolean;
}

const AudioFilesList: React.FC<Props> = ({ files, onPlay, onEdit, onDelete, onAddFile, pageSize = 10, fullMode = false }) => {
  const [displayFiles, setDisplayFiles] = useState<AudioRecordingDocument[]>([]);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLUListElement>(null);
  // No longer needed as we're using the visualization hook for playback

  // Use the advanced audio playback with visualization hook
  const { play, stop, visualizationData, currentPlayingId, isPlaying } = useAudioPlaybackWithVisualization();

  // Pagination logic
  useEffect(() => {
    setDisplayFiles(files.slice(0, page * pageSize));
  }, [files, page, pageSize]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const ul = listRef.current;
    if (!ul) return;
    if (ul.scrollTop + ul.clientHeight >= ul.scrollHeight - 50) {
      if (displayFiles.length < files.length) {
        setPage((p) => p + 1);
      }
    }
  }, [displayFiles.length, files.length]);

  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    ul.addEventListener("scroll", handleScroll);
    return () => ul.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handlePlay = async (file: AudioRecordingDocument) => {
    if (currentPlayingId === file.id?.toString() && isPlaying) {
      // Stop current playback
      stop();
      return;
    }

    // Start new playback using the visualization hook's play method
    try {
      await play(file.blob, file.id?.toString() || "unknown");

      // Call the onPlay callback if provided
      if (onPlay) {
        onPlay(file);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto p-3 dark:text-white space-y-4">
      {/* Header with Speech Generation Button */}
      {fullMode && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Audio Files</h2>
          <SpeechToAudio onAddFile={onAddFile} onPlay={onPlay} />
        </div>
      )}
      {/* Preview Panel - Always present to prevent layout shift */}
      {fullMode && (
        <div className="bg-gray-800 rounded-lg p-4 min-h-[140px] h-[150px] flex items-center justify-center border border-gray-700">
          <SlidingAudioVisualizer
            visualizationData={visualizationData}
            width={280}
            height={100}
            className="w-full"
            idleMode={!visualizationData}
            isPlaying={isPlaying}
          />
        </div>
      )}
      <ul
        className="shadow-neumorphism space-y-2 rounded-lg overflow-auto max-h-[60vh] min-h-[5rem]"
        ref={listRef}
        style={{ WebkitOverflowScrolling: "touch" /* mobile smooth scroll */ }}
      >
        {displayFiles.map((file) => (
          <li
            key={file.id}
            className={`flex justify-between items-center gap-2 p-2 rounded-md transition-colors ${
              currentPlayingId === file.id?.toString() ? "bg-blue-800 border border-blue-600" : "bg-gray-800"
            }`}
          >
            <span className={`truncate max-w-[40vw] sm:max-w-xs ${currentPlayingId === file.id?.toString() ? "text-blue-200 font-medium" : ""}`}>
              {file.name}
              {currentPlayingId === file.id?.toString() && <span className="ml-2 text-xs text-blue-400">♪ Playing</span>}
            </span>
            <div className="flex gap-2 items-center">
              {currentPlayingId === file.id?.toString() && isPlaying ? (
                <ShinButton onClick={stop} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs" aria-label="Stop">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
                    />
                  </svg>
                </ShinButton>
              ) : (
                <ShinButton onClick={() => handlePlay(file)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" aria-label="Play">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                    />
                  </svg>
                </ShinButton>
              )}

              <a
                href={URL.createObjectURL(file.blob)}
                download={file.name}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs relative shinitem shin-glass shinitem-perspective transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </a>
              {onEdit && (
                <ShinButton className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 text-xs" onClick={() => onEdit(file)} aria-label="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </ShinButton>
              )}
              {onDelete && (
                <ShinButton onClick={() => onDelete(file)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs" aria-label="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </ShinButton>
              )}
            </div>
          </li>
        ))}
        {displayFiles.length < files.length && <li className="text-center text-gray-400 py-2 text-sm">Loading more...</li>}
        {files.length === 0 && <li className="text-center text-gray-400 py-2 text-sm">No files yet.</li>}
      </ul>
      {/* No Speech Generation Dialog needed here as it's handled by the SpeechToAudio component */}
    </div>
  );
};

export default AudioFilesList;
