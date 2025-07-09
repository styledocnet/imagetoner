import React, { useEffect, useRef } from "react";

interface VizBarProps {
  frequencyStats: Uint8Array;
  sampleRate: number;
}

const VizBar: React.FC<VizBarProps> = ({ frequencyStats, sampleRate = 44100 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawVizBar = () => {
      const { width, height } = canvas;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw grid background
      drawGrid(ctx, width, height);

      // Draw bars
      const barWidth = width / frequencyStats.length;
      frequencyStats.forEach((value, index) => {
        const x = index * barWidth;
        const barHeight = (value / 255) * height;

        // Draw bar
        ctx.fillStyle = "#34d399"; // Green color
        ctx.fillRect(x, height - barHeight, barWidth * 0.8, barHeight);
      });

      // Draw labels
      drawLabels(ctx, width, height);
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gridLines = 5;
      const gridColor = "#444";

      // Horizontal grid lines
      for (let i = 1; i < gridLines; i++) {
        const y = (i / gridLines) * height;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      const verticalLines = 10;
      for (let i = 1; i < verticalLines; i++) {
        const x = (i / verticalLines) * width;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    };

    const drawLabels = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";

      // Amplitude labels (Y-axis)
      for (let i = 0; i <= 5; i++) {
        const y = (i / 5) * height;
        const label = `${((1 - i / 5) * 100).toFixed(0)}%`;
        ctx.fillText(label, 5, y + 3);
      }

      // Frequency labels (X-axis)
      const nyquist = sampleRate / 2;
      const binHz = nyquist / frequencyStats.length;
      const binLabels = 10;
      for (let i = 0; i <= binLabels; i++) {
        const x = (i / binLabels) * width;
        // const label = `${i * Math.floor(frequencyStats.length / binLabels)} Hz`;
        const binIndex = Math.floor((i * frequencyStats.length) / binLabels);
        const labelHz = Math.round(binIndex * binHz);
        const label = `${labelHz} Hz`;
        ctx.fillText(label, x - 15, height - 5);
      }
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    // Initial resize
    resizeCanvas();

    // Draw visualization
    drawVizBar();

    // Handle resize
    const handleResize = () => {
      resizeCanvas();
      drawVizBar();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [frequencyStats]);

  return <canvas ref={canvasRef} className="w-full h-48 bg-gradient-to-tr" />;
};

export default VizBar;
