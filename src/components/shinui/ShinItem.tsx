import { forwardRef, ButtonHTMLAttributes, ElementType, ReactNode } from "react";
import clsx from "clsx";

interface ShinItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

const ShinItem = forwardRef<HTMLElement, ShinItemProps>(({ as: Component = "button", children, className, ...props }, ref) => (
  <Component
    ref={ref as any}
    className={clsx(
      "shinitem px-4 py-2 rounded-md shadow transition duration-300 bg-white/30 dark:bg-white/10 backdrop-blur border border-white/20 hover:bg-white/50 dark:hover:bg-white/20 text-gray-900 dark:text-white",
      className,
    )}
    {...props}
  >
    {children}
  </Component>
));

ShinItem.displayName = "ShinItem";
export default ShinItem;
