import React from "react";
import Modal from "./Modal";
import Webcam from "./Webcam";

interface WebCamInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

const WebCamInputModal: React.FC<WebCamInputModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Capture Image"
      onClose={onClose}
      footer={null}
    >
      {isOpen && (
        <Webcam
          audio={false}
          onCapture={(image) => {
            console.log("Captured Image:", image);
            onCapture(image);
            onClose();
          }}
        />
      )}
    </Modal>
  );
};

export default WebCamInputModal;
