import { useRef, useState } from "react";
import * as Tone from "tone";

export function useTonePlaybackWithStats() {
  const [frequencyStats, setFrequencyStats] = useState<Float32Array | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const playerRef = useRef<Tone.Player | null>(null);

  const play = async (blob: Blob) => {
    await Tone.start();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = await Tone.context.decodeAudioData(arrayBuffer);

    const analyser = new Tone.Analyser("fft", 1024);
    analyserRef.current = analyser;

    const player = new Tone.Player(buffer).connect(analyser).toDestination();
    playerRef.current = player;

    player.start();

    function updateStats() {
      // getValue() returns Float32Array
      setFrequencyStats(analyser.getValue() as Float32Array);
      if (player.state === "started") {
        requestAnimationFrame(updateStats);
      }
    }
    updateStats();

    player.onstop = () => {
      setFrequencyStats(null);
    };
  };

  return { play, frequencyStats };
}
