import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { FormLabel } from "../ui/form";

export interface InputWithDescriptionProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  formLabel?: React.ReactNode;
  description?: React.ReactNode;
  iconEnd?: boolean;
}

const InputWithDescription = React.forwardRef<
  HTMLInputElement,
  InputWithDescriptionProps
>(
  (
    { icon, label, formLabel, description, iconEnd, className, type, ...props },
    ref,
  ) => {
    return (
      <div className="flex gap-20">
        <div className=" w-[20rem]">
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          {label && <Label>{label}</Label>}
          <div className=" text-sm text-muted-foreground">{description}</div>
        </div>
        <div className="h-fit w-full">
          <div className={cn(`relative`, className)}>
            <input
              type={type}
              className={cn(
                `${
                  icon ? `${iconEnd ? "pl-3" : "pl-10"} pr-3` : "px-3"
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
                {icon}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
InputWithDescription.displayName = "InputWithDescription";

export { InputWithDescription };
