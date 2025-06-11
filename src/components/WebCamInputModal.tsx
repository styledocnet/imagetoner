import React, { useRef } from "react";
import Modal from "./Modal";
import WebCam from "./WebCam";

interface WebCamInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  canvasSize: { width: number; height: number };
}

const WebCamInputModal: React.FC<WebCamInputModalProps> = ({ isOpen, onClose, onCapture, canvasSize }) => {
  const webcamRef = useRef<any>(null);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      onCapture(imageSrc);
      console.log("Stopping webcam after capture...");
      webcamRef.current.stopWebcam();
      onClose();
    }
  };

  // if (!isOpen) {
  //   return <></>;
  // }

  return (
    <Modal
      isOpen={isOpen}
      title="Capture Image"
      onClose={() => {
        console.log("Closing modal, stopping webcam...");
        if (webcamRef.current) {
          console.log("Stopping webcam on modal close...");
          webcamRef.current.stopWebcam();
        }
        onClose();
      }}
      footer={
        <button onClick={handleCapture} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
          Capture
        </button>
      }
    >
      <WebCam isOpen={isOpen} audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={canvasSize.width} height={canvasSize.height} />
    </Modal>
  );
};

export default WebCamInputModal;
