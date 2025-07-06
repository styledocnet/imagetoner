import React, { useRef, useEffect } from "react";

interface SpectrumAnalyzerProps {
  frequencyStats: Uint8Array;
}

const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  frequencyStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const { width, height } = parent.getBoundingClientRect();
    canvas.width = width; // Set internal resolution
    canvas.height = height; // Set internal resolution
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize the canvas initially
    resizeCanvas();

    // Function to draw the frequency spectrum
    const drawSpectrum = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / frequencyStats.length;
      for (let i = 0; i < frequencyStats.length; i++) {
        const value = frequencyStats[i];
        const barHeight = (value / 255) * canvas.height;

        // Use a logarithmic scale for the frequency axis
        const x =
          (Math.log1p(i) / Math.log1p(frequencyStats.length)) * canvas.width;

        ctx.fillStyle = `hsl(${(i / frequencyStats.length) * 360}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      }
    };

    drawSpectrum();

    // Resize the canvas on window resize
    const handleResize = () => {
      resizeCanvas();
      drawSpectrum();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [frequencyStats]);

  return <canvas ref={canvasRef} className="w-full h-48" />;
};

export default SpectrumAnalyzer;
