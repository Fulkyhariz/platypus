import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { FormLabel } from "../ui/form";

export interface IUniInputDescription
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  formLabel?: React.ReactNode;
  description?: React.ReactNode;
}

const UniInputDescription = ({
  label,
  formLabel,
  description,
  className,
  children,
}: IUniInputDescription) => {
  return (
    <div className="flex gap-20">
      <div className=" w-[20rem] ">
        {formLabel && <FormLabel>{formLabel}</FormLabel>}
        {label && <Label>{label}</Label>}
        <div className=" text-sm text-muted-foreground">{description}</div>
      </div>
      <div className={cn("relative h-fit w-full", className)}>{children}</div>
    </div>
  );
};

export default UniInputDescription;
