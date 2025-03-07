import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  footer,
  children,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-md shadow-lg z-10 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400"
          >
            &times;
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
