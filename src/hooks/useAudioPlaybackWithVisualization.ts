import { useRef, useState, useCallback } from "react";
import * as Tone from "tone";

export interface PlaybackVisualizationData {
  frequencyData: Uint8Array;
  progress: number; // 0 to 1
  duration: number; // in seconds
  currentTime: number; // in seconds
  isPlaying: boolean;
}

export function useAudioPlaybackWithVisualization() {
  const [visualizationData, setVisualizationData] = useState<PlaybackVisualizationData | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setVisualizationData(null);
    setCurrentPlayingId(null);
    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
  }, []);

  const play = useCallback(async (blob: Blob, fileId: string) => {
    try {
      // Stop any currently playing audio
      stop();

      await Tone.start();

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = await Tone.context.decodeAudioData(arrayBuffer);

      // Create Web Audio API analyzer for better control
      const audioContext = Tone.context.rawContext as AudioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Smaller for better performance
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create Tone.js player and connect to analyzer
      const player = new Tone.Player(buffer);
      playerRef.current = player;

      // Connect player to analyzer and destination
      const toneAnalyser = new Tone.Analyser("fft", 128);
      player.connect(toneAnalyser);
      player.connect(analyser as any); // Connect to Web Audio analyzer
      player.toDestination();

      const duration = buffer.duration;
      startTimeRef.current = audioContext.currentTime;
      setCurrentPlayingId(fileId);

      // Start playback
      player.start();

      // Animation loop for visualization updates
      const updateVisualization = () => {
        if (!analyser || !player || player.state !== "started") {
          setVisualizationData(null);
          setCurrentPlayingId(null);
          return;
        }

        const bufferLength = analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(frequencyData);

        const currentTime = audioContext.currentTime - startTimeRef.current;
        const progress = Math.min(currentTime / duration, 1);

        setVisualizationData({
          frequencyData,
          progress,
          duration,
          currentTime: Math.min(currentTime, duration),
          isPlaying: true,
        });

        if (progress < 1 && player.state === "started") {
          animationFrameRef.current = requestAnimationFrame(updateVisualization);
        } else {
          // Playback finished
          setTimeout(() => {
            stop();
          }, 100);
        }
      };

      // Start the visualization loop
      updateVisualization();

      // Handle playback end
      player.onstop = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setVisualizationData(null);
        setCurrentPlayingId(null);
      };

    } catch (error) {
      console.error("Error playing audio:", error);
      stop();
    }
  }, [stop]);

  const pause = useCallback(() => {
    if (playerRef.current && playerRef.current.state === "started") {
      playerRef.current.stop();
      pauseTimeRef.current = Tone.context.currentTime;
    }
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current && pauseTimeRef.current > 0) {
      const elapsed = pauseTimeRef.current - startTimeRef.current;
      playerRef.current.start(0, elapsed);
      startTimeRef.current = Tone.context.currentTime - elapsed;
      pauseTimeRef.current = 0;
    }
  }, []);

  return {
    play,
    stop,
    pause,
    resume,
    visualizationData,
    currentPlayingId,
    isPlaying: visualizationData?.isPlaying || false,
  };
}
