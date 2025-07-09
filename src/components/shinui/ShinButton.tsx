import React from "react";
import clsx from "clsx";

type ShinButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  color?: "primary" | "success" | "danger" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
};

const colorMap: Record<string, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  gray: "bg-gray-500 hover:bg-gray-600 text-white",
};

const sizeMap: Record<string, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-4 py-2",
  lg: "text-lg px-6 py-3",
};

const ShinButton: React.FC<ShinButtonProps> = ({ children, onClick, disabled = false, color = "primary", size = "md", className = "", type = "button" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "relative shinitem shin-glass shinitem-perspective rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
      colorMap[color],
      sizeMap[size],
      className,
    )}
  >
    {children}
  </button>
);

export default ShinButton;
