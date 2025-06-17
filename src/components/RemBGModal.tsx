import React, { useState } from "react";
import Modal from "./Modal";

interface RemBGModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApply: () => Promise<void>; // Make sure this is an async function!
}

const RemBGModal: React.FC<RemBGModalProps> = ({ isOpen, imageSrc, onClose, onApply }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      title="Remove Background Settings"
      onClose={onClose}
      footer={
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isProcessing}
          onClick={async () => {
            setIsProcessing(true);
            setStatus("Removing background...");
            try {
              await onApply();
              setStatus("Success!");
            } catch (err) {
              console.error(err);
              setStatus("Error occurred while removing background.");
            } finally {
              setIsProcessing(false);
            }
          }}
        >
          {isProcessing ? "Processing..." : "Apply"}
        </button>
      }
    >
      <div className="flex flex-col items-center gap-4">
        {imageSrc ? <img src={imageSrc} alt="Preview" className="max-h-48 object-contain border rounded" /> : <p>No image to preview</p>}
        {status && <div className="text-sm text-gray-500">{status}</div>}
      </div>
    </Modal>
  );
};

export default RemBGModal;
