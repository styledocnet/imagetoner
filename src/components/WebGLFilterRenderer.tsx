import React, { useEffect, useImperativeHandle, forwardRef, useRef, useState } from "react";
import { applyShaderFilter } from "../utils/glUtils";

const WebGLFilterRenderer = forwardRef(({ image, filter, params, onRenderComplete, width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  // Export as DataURL
  useImperativeHandle(ref, () => ({
    exportImage: () => {
      return new Promise<string>((resolve) => {
        if (!canvasRef.current) {
          console.error("Canvas reference is null. Cannot export image.");
          resolve("");
          return;
        }
        resolve(canvasRef.current.toDataURL("image/png"));
      });
    },
  }));

  useEffect(() => {
    setReady(false);

    if (!image || !canvasRef.current) {
      console.error("Image or canvasRef is not initialized.");
      return;
    }

    const gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.error("Failed to initialize WebGL context.");
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      try {
        applyShaderFilter(gl, img, filter, params);
        gl.flush();
        if (gl.finish) gl.finish();

        setReady(true);

        // For preview: notify parent immediately
        if (onRenderComplete) {
          onRenderComplete(canvasRef.current.toDataURL("image/png"));
        }
      } catch (error) {
        console.error("Error applying shader filter:", error);
      }
    };

    img.onerror = () => {
      console.error("Failed to load the image for WebGL rendering.");
    };
  }, [image, filter, params, width, height, onRenderComplete]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", maxWidth: "100%", maxHeight: "200px" }} />;
});

export default WebGLFilterRenderer;
