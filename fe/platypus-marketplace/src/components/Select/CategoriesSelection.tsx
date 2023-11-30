import * as React from "react";

import { Label } from "../ui/label";
import { FormLabel } from "../ui/form";
import { Select } from "../ui/select";

export interface ICategoriesSelection {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  formLabel?: React.ReactNode;
  description?: React.ReactNode;
}

const CategoriesSelection = ({
  label,
  formLabel,
  description,
}: ICategoriesSelection) => {
  return (
    <div className="flex gap-20">
      <div className=" w-[20rem] ">
        {formLabel && <FormLabel>{formLabel}</FormLabel>}
        {label && <Label>{label}</Label>}
        <div className=" text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="relative h-fit w-full">
        <Select></Select>
      </div>
    </div>
  );
};

export default CategoriesSelection;
