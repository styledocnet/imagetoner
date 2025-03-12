import React, { useRef } from "react";
import Modal from "./Modal";
import Webcam from "./Webcam";

interface WebCamInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  canvasSize: { width: number; height: number };
}

const WebCamInputModal: React.FC<WebCamInputModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  canvasSize,
}) => {
  const webcamRef = useRef<any>(null);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      onCapture(imageSrc);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Capture Image"
      onClose={() => {
        if (webcamRef.current) {
          webcamRef.current.stopWebcam(); // Stop the webcam when closing the modal
        }
        onClose();
      }}
      footer={
        <button
          onClick={handleCapture}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Capture
        </button>
      }
    >
      {isOpen && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={canvasSize.width}
          height={canvasSize.height}
        />
      )}
    </Modal>
  );
};

export default WebCamInputModal;
