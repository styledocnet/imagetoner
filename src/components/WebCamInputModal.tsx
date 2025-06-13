import React, { useRef, useCallback, useState } from "react";
import Modal from "./Modal";
import Webcam from "react-webcam";
import Switch from "./Switch";

interface WebCamInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  canvasSize: { width: number; height: number };
}

const WebCamInputModal: React.FC<WebCamInputModalProps> = ({ isOpen, onClose, onCapture, canvasSize }) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [preserveSize, setPreserveSize] = useState(false);

  const videoConstraints = {
    width: { ideal: 4096 },
    height: { ideal: 2160 },
    facingMode,
  };

  const resizeImageToCanvas = (imageSrc: string, targetWidth: number, targetHeight: number): Promise<string> =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.src = imageSrc;
    });

  const handleCapture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        if (preserveSize) {
          onCapture(imageSrc);
        } else {
          const resized = await resizeImageToCanvas(imageSrc, canvasSize.width, canvasSize.height);
          onCapture(resized);
        }
      }
      onClose();
    }
  }, [onCapture, onClose, canvasSize.width, canvasSize.height, preserveSize]);

  const handleSwitchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      title="Capture Image"
      onClose={onClose}
      footer={
        <div className="flex gap-2 items-center">
          {/* Preserve Camera Size */}
          <Switch checked={preserveSize} onChange={setPreserveSize} label="Preserve" />

          <button type="button" onClick={handleSwitchCamera} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition">
            Switch Cam
          </button>
          <button onClick={handleCapture} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
            Capture
          </button>
        </div>
      }
    >
      {isOpen && (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{
            borderRadius: 8,
            width: "100%",
            height: "auto",
            background: "#000",
            objectFit: "cover",
          }}
        />
      )}
    </Modal>
  );
};

export default WebCamInputModal;
