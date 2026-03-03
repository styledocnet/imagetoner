import React, { useRef, useEffect, useState } from "react";
import Modal from "./Modal";

interface DocumentTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onApply: (newTitle: string) => void;
}

const DocumentTitleModal: React.FC<DocumentTitleModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  onApply,
}) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isOpen]);

  const handleApply = () => {
    if (title.trim()) {
      onApply(title.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Edit Document Title"
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition font-semibold"
          >
            Apply
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Document Title
          </label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document title"
            maxLength={255}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {title.length}/255 characters
          </p>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p>Tip: Press <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Enter</kbd> to apply or <kbd className="bg-gray-200 dark:bg-gray-700 px-1 rounded">Escape</kbd> to cancel.</p>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentTitleModal;
