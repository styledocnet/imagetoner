import { useState, useEffect, useRef } from "react";
import { freqToNote } from "../../utils/audio/notes";
import VizBar from "./Vizbar";
import AudioFilesList from "./AudioFilesList";
import { calculatePitchAutocorrelation, calculatePitchYIN } from "../../utils/audio/calculations";
import SpectrumAnalyzer from "./SpectrumAnalyzer";
import ShinSelectBox from "../shinui/ShinSelectBox";
import ShinButton from "../shinui/ShinButton";
import { audioStorage } from "../../storage/audioStorage";
import { AudioRecordingDocument } from "@/types/audio";
import { useTonePlaybackWithStats } from "@/hooks/useTonePlaybackWithStats";
import * as Tone from "tone";

const Recorder = () => {
  const [isArmed, setIsArmed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [noteInfo, setNoteInfo] = useState<{ note: string; cents: number } | null>(null);
  const [frequencyStats, setFrequencyStats] = useState<Uint8Array | null>(null);
  const [lastSevenNotes, setLastSevenNotes] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioRecordingDocument[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [pitchDetectionMethod, setPitchDetectionMethod] = useState("YIN");
  const [visualizationType, setVisualizationType] = useState("VizBar");
  const { play, toneFrequencyStats } = useTonePlaybackWithStats();
  const [sampleRate, setSampleRate] = useState(44100);

  const pitchOptions = [
    { label: "YIN", value: "YIN" },
    { label: "Autocorrelation", value: "Autocorrelation" },
  ];

  const vizOptions = [
    { label: "VizBar", value: "VizBar" },
    { label: "SpectrumAnalyzer", value: "SpectrumAnalyzer" },
  ];

  // Load saved audio files from storage on mount
  useEffect(() => {
    audioStorage.getAudioFiles().then((files) => setAudioFiles(files.reverse())); // latest first
  }, []);

  // Save audio file to IndexedDB with metadata
  const handleSaveRecording = async (blob: Blob, name: string) => {
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
      name,
      blob,
      mimeType: blob.type,
      duration,
    });
    // Update UI list
    const files = await audioStorage.getAudioFiles();
    setAudioFiles(files.reverse());
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 2 } });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
    }
    streamRef.current = stream;
    const audioContext = new window.AudioContext();
    audioContextRef.current = audioContext;
    setSampleRate(audioContext.sampleRate);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = async (e) => {
      const mimeType = "audio/wav";
      const blob = new Blob([e.data], { type: mimeType });
      const name = `Recording-${audioFiles.length + 1}.wav`;
      await handleSaveRecording(blob, name);
    };

    setIsArmed(true);
  };

  const handleRecord = () => {
    if (isArmed && !isRecording) {
      setIsRecording(true);
      mediaRecorderRef.current?.start();
    } else {
      stopRecording();
    }
  };

  useEffect(() => {
    if (!isArmed || !analyserRef.current || !streamRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const timeDomainArray = new Float32Array(bufferLength);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const processAudio = () => {
      analyser.getFloatTimeDomainData(timeDomainArray);

      const detectedPitch =
        pitchDetectionMethod === "YIN"
          ? calculatePitchYIN(timeDomainArray, audioContextRef.current?.sampleRate || 44100)
          : calculatePitchAutocorrelation(timeDomainArray, audioContextRef.current?.sampleRate || 44100);

      setPitch(detectedPitch);
      if (detectedPitch) {
        const noteInfo = freqToNote(detectedPitch);
        setNoteInfo(noteInfo);
        if (noteInfo) {
          setLastSevenNotes((prevNotes) => {
            const newNotes = [noteInfo.note, ...prevNotes];
            return newNotes.slice(0, 7);
          });
        }
      } else {
        setNoteInfo(null);
      }

      analyser.getByteFrequencyData(dataArray);
      setFrequencyStats(new Uint8Array(dataArray));

      requestAnimationFrame(processAudio);
    };

    processAudio();
  }, [isArmed, pitchDetectionMethod]);

  return (
    <div className="flex flex-col items-center transition-colors duration-200">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <ShinButton onClick={startRecording} disabled={isArmed} size="lg" color={isArmed ? "gray" : "primary"} className="font-semibold">
          {isArmed ? "Armed" : "Arm"}
        </ShinButton>
        <ShinButton
          onClick={handleRecord}
          disabled={!isArmed}
          size="lg"
          color={!isArmed ? "gray" : isRecording ? "danger" : "success"}
          className="font-semibold"
        >
          {isRecording ? "Stop" : "Record"}
        </ShinButton>
      </div>
      <div className="w-full max-w-xl bg-muted/50 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-xl font-semibold mb-2">Real-time Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <span>
            Pitch: <span className="font-mono">{pitch ? `${pitch.toFixed(2)} Hz` : "N/A"}</span>
          </span>
          <span>
            Note: <span className="font-mono">{noteInfo ? `${noteInfo.note} (${noteInfo.cents} cents)` : "N/A"}</span>
          </span>
          <span className="col-span-2">
            Last Notes:
            <span className="font-mono">[{lastSevenNotes.join(", ")}]</span>
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 w-full max-w-xl mb-2 items-center">
        <label className="font-semibold min-w-fit">Pitch Detection:</label>
        <ShinSelectBox
          options={pitchOptions}
          value={pitchDetectionMethod}
          onChange={setPitchDetectionMethod}
          placeholder="Select..."
          small
          className="flex-1"
        />
        <label className="font-semibold min-w-fit">Visualization:</label>
        <ShinSelectBox options={vizOptions} value={visualizationType} onChange={setVisualizationType} small className="flex-1" />
      </div>
      <div className="w-full max-w-4xl mx-auto p-4">
        {frequencyStats &&
          (visualizationType === "VizBar" ? (
            <VizBar frequencyStats={frequencyStats} sampleRate={sampleRate} />
          ) : (
            <SpectrumAnalyzer frequencyStats={frequencyStats} />
          ))}
      </div>
      {audioFiles.length > 0 && (
        <AudioFilesList
          files={audioFiles.map((f) => ({
            id: f.id?.toString() || "",
            name: f.name,
            blob: f.blob,
            duration: f.duration,
          }))}
          onPlay={(file) => {
            play(file.blob);
          }}
        />
      )}
    </div>
  );
};

export default Recorder;
