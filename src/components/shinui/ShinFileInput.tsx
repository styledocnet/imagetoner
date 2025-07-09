import React from "react";
import clsx from "clsx";

type ShinFileInputProps = {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  accept?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
};

const ShinFileInput: React.FC<ShinFileInputProps> = ({ onChange, disabled = false, accept = "*", className = "", inputRef }) => {
  return (
    <input
      type="file"
      accept={accept}
      onChange={onChange}
      disabled={disabled}
      ref={inputRef}
      className={clsx(
        "block w-full text-sm dark:text-white text-gray-900",
        "file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0",
        "file:text-sm file:font-semibold",
        "file:bg-blue-100 dark:file:bg-blue-800",
        "file:text-blue-700 dark:file:text-blue-200",
        "hover:file:bg-blue-200 dark:hover:file:bg-blue-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    />
  );
};

export default ShinFileInput;
