import { useState } from "react";
// import { Document } from "../types";

const useDocument = () => {
  const [documentSize, setDocumentSize] = useState({
    width: 1920,
    height: 1080,
  });
  const [canvasSize, setCanvasSize] = useState({ width: 960, height: 540 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  return {
    documentSize,
    setDocumentSize,
    canvasSize,
    setCanvasSize,
    aspectRatio,
    setAspectRatio,
  };
};

export default useDocument;
