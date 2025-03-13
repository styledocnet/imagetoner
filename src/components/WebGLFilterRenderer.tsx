import React, { useRef, useEffect } from "react";
import { initGL, applyShaderFilter } from "../utils/glUtils";

interface WebGLFilterRendererProps {
  image: string;
  filter: string;
  params: any;
  onUpdate: (filteredImage: string) => void;
  width: number;
  height: number;
}

const WebGLFilterRenderer: React.FC<WebGLFilterRendererProps> = ({
  image,
  filter,
  params,
  onUpdate,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      applyShaderFilter(gl, texture, filter, params);

      // Ensure canvas is still mounted
      if (!canvasRef.current) {
        console.error("Canvas reference is null after applying shader filter");
        return;
      }

      // Immediate update after applying filter
      const filteredImage = canvasRef.current.toDataURL("image/png");
      console.log("Filtered image generated:", filteredImage);
      onUpdate(filteredImage);
    };
    texture.onerror = () => {
      console.error("Failed to load the image");
    };
  }, [image, filter, params]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default WebGLFilterRenderer;
