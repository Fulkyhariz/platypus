import { cn } from "@/lib/utils";
import React from "react";

export interface SelectionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SelectionButton = React.forwardRef<
  HTMLButtonElement,
  SelectionButtonProps
>(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "relative flex items-center justify-between border-b-[1px] border-border px-3 py-3",
        className,
      )}
      ref={ref}
      {...props}
    ></button>
  );
});

export default SelectionButton;
