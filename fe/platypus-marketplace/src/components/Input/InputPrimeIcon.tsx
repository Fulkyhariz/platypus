import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconEnd?: boolean;
}

const InputPrimeIcon = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className, type, iconEnd, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className={cn(`relative`, className)}>
          <input
            type={type}
            className={cn(
              `${
                icon ? `${iconEnd ? "pl-3" : "pl-12"} pr-3` : "px-3"
              } flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`,
              className,
            )}
            ref={ref}
            {...props}
          />
          {icon && (
            <div
              className={`${
                iconEnd ? "right-0 rounded-r-md" : "rounded-l-md"
              } absolute top-0 flex h-full items-center justify-center bg-primary p-2 text-white`}
            >
              {icon && icon}
            </div>
          )}
        </div>
      </div>
    );
  },
);
InputPrimeIcon.displayName = "InputPrimeIcon";

export { InputPrimeIcon };
