import React, { useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { applyShaderFilter } from "../utils/glUtils";

const WebGLFilterRenderer = forwardRef(({ image, filter, params, onRenderComplete, width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      return new Promise<string>((resolve) => {
        if (!canvasRef.current) {
          console.error("Canvas reference is null. Cannot export image.");
          resolve("");
          return;
        }

        const dataURL = canvasRef.current.toDataURL("image/png");
        console.log("Exported Image Data URL:", dataURL); // Debugging log
        resolve(dataURL);
      });
    },
  }));

  useEffect(() => {
    if (!image || !canvasRef.current) {
      console.error("Image or canvasRef is not initialized.");
      return;
    }

    const gl = canvasRef.current.getContext("webgl");
    if (!gl) {
      console.error("Failed to initialize WebGL context.");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // Ensures CORS compatibility
    img.src = image;

    img.onload = () => {
      console.log("Image loaded successfully. Applying shader filter...");
      try {
        applyShaderFilter(gl, img, filter, params);
        const dataURL = canvasRef.current!.toDataURL("image/png");
        console.log("Filtered Image Data URL:", dataURL); // Debugging log
        onRenderComplete(dataURL);
      } catch (error) {
        console.error("Error applying shader filter:", error);
      }
    };

    img.onerror = () => {
      console.error("Failed to load the image for WebGL rendering.");
    };
  }, [image, filter, params]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", maxWidth: "100%", maxHeight: "200px" }} />;
});

export default WebGLFilterRenderer;
