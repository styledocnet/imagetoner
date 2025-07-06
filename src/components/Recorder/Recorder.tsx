import { useState, useEffect, useRef } from "react";
import { freqToNote } from "../../utils/audio/notes";
import VizBar from "./Vizbar";
import AudioFilesList from "./AudioFilesList";
import { calculatePitchAutocorrelation, calculatePitchYIN } from "../../utils/audio/calculations";
import SpectrumAnalyzer from "./SpectrumAnalyzer";
import ShinSelectBox from "../shinui/ShinSelectBox";

const Recorder = () => {
  const [isArmed, setIsArmed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [noteInfo, setNoteInfo] = useState<{
    note: string;
    cents: number;
  } | null>(null);
  const [frequencyStats, setFrequencyStats] = useState<Uint8Array | null>(null);
  const [lastSevenNotes, setLastSevenNotes] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioFiles, setAudioFiles] = useState<{ id: string; name: string; blob: Blob }[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [pitchDetectionMethod, setPitchDetectionMethod] = useState("YIN");
  const [visualizationType, setVisualizationType] = useState("VizBar");
  const { theme } = { theme: "dark" };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const startPlayback = (audio: HTMLAudioElement, audioContext: AudioContext) => {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    setFrequencyStats(new Uint8Array(analyser.frequencyBinCount));

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser).connect(audioContext.destination);

    const processAudio = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      setFrequencyStats(dataArray);

      if (!audio.paused) {
        requestAnimationFrame(processAudio);
      }
    };

    audio.onplay = () => {
      requestAnimationFrame(processAudio);
    };

    audio.play().catch((error) => {
      console.error("Playback error:", error);
    });
  };

  const playAudio = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audioContext = new window.AudioContext();
    const audio = new Audio(url);

    if (audioContext.state === "suspended") {
      audioContext.resume().then(() => {
        startPlayback(audio, audioContext);
      });
    } else {
      startPlayback(audio, audioContext);
    }

    audio.onloadedmetadata = () => {
      console.log("Audio duration:", audio.duration);
    };
  };

  const startRecording = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 2,
        },
      });
    } catch (error) {
      console.error("Mono fallback, Error getting user media:", error);
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
        },
      });
    }
    streamRef.current = stream;
    const audioContext = new window.AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      let mimeType = "audio/wav";
      const blob = new Blob([e.data], { type: mimeType });
      const id = crypto.randomUUID();
      const name = `Recording-${audioFiles.length + 1}.wav`;
      setAudioFiles((prev) => [...prev, { id, name, blob }]);
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
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 ${theme === "light" ? "bg-backgroundLight text-textLight" : "bg-backgroundDark text-textDark"}`}
    >
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Audio Recorder</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <button
          onClick={startRecording}
          disabled={isArmed}
          className={`px-6 py-2 rounded-md font-semibold shadow-neumorphism ring ring-gray-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ${
            isArmed ? "bg-gray-600 cursor-not-allowed" : "bg-primary hover:bg-primary-light"
          }`}
        >
          {isArmed ? "Armed" : "Arm"}
        </button>
        <button
          onClick={handleRecord}
          disabled={!isArmed}
          className={`px-6 py-2 rounded-md font-semibold shadow-neumorphism ring ring-gray-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ${
            !isArmed ? "bg-gray-600 cursor-not-allowed" : isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRecording ? "Stop" : "Record"}
        </button>
      </div>
      <div className="w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Real-time Stats</h2>
        <p className="mb-4">Pitch: {pitch ? `${pitch.toFixed(2)} Hz` : "N/A"}</p>
        <p className="mb-4">Note: {noteInfo ? `${noteInfo.note} (${noteInfo.cents} cents)` : "N/A"}</p>
        <p className="mb-4">Last Notes: [{lastSevenNotes.join(", ")}]</p>
      </div>
      <div className="mb-6 w-full">
        <label className="mr-2 font-semibold">Pitch Detection Method:</label>
        <ShinSelectBox
          options={["YIN", "Autocorrelation"]}
          value={pitchDetectionMethod}
          onChange={setPitchDetectionMethod}
          label="Pitch Method"
          placeholder="Select..."
          className="my-class"
          small
        />
      </div>
      <div className="mb-6 w-full">
        <label className="mr-2 font-semibold">Visualization Type:</label>
        <ShinSelectBox options={["VizBar", "SpectrumAnalyzer"]} value={visualizationType} onChange={setVisualizationType} />
      </div>
      <div className="w-full max-w-4xl mx-auto p-4">
        {frequencyStats && (visualizationType === "VizBar" ? <VizBar frequencyStats={frequencyStats} /> : <SpectrumAnalyzer frequencyStats={frequencyStats} />)}
      </div>
      <AudioFilesList files={audioFiles} onPlay={playAudio} />
    </div>
  );
};

export default Recorder;
