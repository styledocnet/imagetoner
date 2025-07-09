import React, { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ShinToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const ShinToolbar: React.FC<ShinToolbarProps> = ({ children, className, ...props }) => (
  <div
    className={clsx(
      "shin-glass shinitem flex items-center justify-between p-4 gap-4 bg-white/40 dark:bg-black/30 backdrop-blur-lg rounded-2xl  border border-white/20 shadow-xl",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default ShinToolbar;
