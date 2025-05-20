import React, { useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { applyShaderFilter } from "../utils/glUtils";

interface WebGLFilterRendererProps {
  image: string;
  filter: string;
  params: any;
  onRenderComplete: (filteredImage: string) => void;
  width: number;
  height: number;
}

const WebGLFilterRenderer = forwardRef(({ image, filter, params, onRenderComplete, width, height }: WebGLFilterRendererProps, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    exportImage: () => canvasRef.current?.toDataURL("image/png") || "",
    getCanvas: () => canvasRef.current,
  }));

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const gl = canvasRef.current.getContext("webgl");
    if (!gl) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      applyShaderFilter(gl, img, filter, params);
      onRenderComplete(canvasRef.current!.toDataURL("image/png"));
    };
  }, [image, filter, params]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", maxWidth: "100%", maxHeight: "200px" }} />;
});

export default WebGLFilterRenderer;
