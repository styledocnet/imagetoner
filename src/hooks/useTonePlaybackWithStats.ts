import { useRef, useState } from "react";
import * as Tone from "tone";

export function useTonePlaybackWithStats() {
  const [frequencyStats, setFrequencyStats] = useState<Float32Array | null>(null);
  const analyserRef = useRef<any | null>(null);
  const playerRef = useRef<any | null>(null);

  const play = async (blob: Blob) => {
    await Tone.start();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = await (Tone.context as any).decodeAudioData(arrayBuffer);

    const analyser = new (Tone as any).Analyser("fft", 1024);
    analyserRef.current = analyser;

    const player = new (Tone as any).Player(buffer).connect(analyser).toDestination();
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
