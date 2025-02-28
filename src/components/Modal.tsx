import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: "small" | "medium" | "large";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = "medium",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-lg",
    large: "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal container */}
      <div
        className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} mx-4`}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 transition"
            title="Close"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4">{children}</div>

        {/* Modal footer */}
        {footer && <div className="p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
