import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { applyShaderFilter } from "../utils/glUtils";

interface WebGLFilterRendererProps {
  image: string;
  filter: string;
  params: any;
  onRenderComplete: (filteredImage: string) => void;
  width: number;
  height: number;
}

const WebGLFilterRenderer = forwardRef<HTMLCanvasElement, WebGLFilterRendererProps>(({ image, filter, params, onRenderComplete, width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  useEffect(() => {
    if (!image) {
      console.warn("Image source is empty");
      return;
    }
    if (!canvasRef.current) {
      console.error("Canvas reference is null");
      return;
    }

    const gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const texture = new Image();
    texture.src = image;

    texture.onload = () => {
      console.log("Applying shader filter:", filter, "with params:", params);

      // Apply shader filter using WebGL
      applyShaderFilter(gl, texture, filter, params);

      // Ensure canvas is still mounted
      if (!canvasRef.current) {
        console.error("Canvas reference is null after applying shader filter");
        return;
      }

      // Generate the filtered image as a data URL
      const filteredImage = canvasRef.current.toDataURL("image/png");
      console.log("onRenderComplete: Filtered image generated");
      onRenderComplete(filteredImage);
    };

    texture.onerror = () => {
      console.error("Failed to load the image");
    };
  }, [image, filter, params, onRenderComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: "block",
        maxWidth: "100%",
        maxHeight: "200px",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    />
  );
});

export default WebGLFilterRenderer;
