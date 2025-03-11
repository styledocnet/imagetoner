import React, { useState } from "react";
import Modal from "./Modal";

interface FillImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasSize: { width: number; height: number };
  onFill: (image: string) => void;
}

const FillImageModal: React.FC<FillImageModalProps> = ({
  isOpen,
  onClose,
  canvasSize,
  onFill,
}) => {
  const [fillType, setFillType] = useState("solid");
  const [color, setColor] = useState("#ffffff");

  const createImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (ctx) {
      ctx.fillStyle =
        fillType === "solid" ? color : "linear-gradient(to bottom, #fff, #000)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    onFill(canvas.toDataURL("image/png"));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Fill Background"
      onClose={onClose}
      footer={<button onClick={createImage}>Apply</button>}
    >
      <label>Fill Type:</label>
      <select value={fillType} onChange={(e) => setFillType(e.target.value)}>
        <option value="solid">Solid</option>
      </select>
    </Modal>
  );
};

export default FillImageModal;
