import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { applyShaderFilter } from "../utils/glUtils";

export interface WebGLFilterRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
  exportImage: () => string;
}

interface WebGLFilterRendererProps {
  image: string;
  filter: string;
  params: any;
  width: number;
  height: number;
  onRenderComplete?: (url: string) => void;
}
const WebGLFilterRenderer = forwardRef<WebGLFilterRendererHandle, WebGLFilterRendererProps>(
  ({ image, filter, params, width, height, onRenderComplete }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      exportImage: () => canvasRef.current?.toDataURL("image/png") ?? "",
    }));

    useEffect(() => {
      if (!image || !canvasRef.current) return;
      // Ensure preserveDrawingBuffer: true!
      const gl = canvasRef.current.getContext("webgl", { preserveDrawingBuffer: true });
      if (!gl) return;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = image;
      img.onload = () => {
        applyShaderFilter(gl, img, filter, params);
        gl.flush();
        if (gl.finish) gl.finish();
        if (canvasRef.current && onRenderComplete) onRenderComplete(canvasRef.current.toDataURL("image/png"));
      };
    }, [image, filter, params, width, height, onRenderComplete]);

    return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", maxWidth: "100%", maxHeight: "200px" }} />;
  },
);

export default WebGLFilterRenderer;
