import { cn } from "@/lib/utils";
import React from "react";

interface IHeaderLined extends React.HTMLAttributes<HTMLDivElement> {}

const HeaderLined = ({ className, children }: IHeaderLined) => {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      <hr className=" visible flex-1" />
      <div className="rounded-full border">
        <h2 className=" px-5 text-xs font-medium lg:text-base xl:text-lg">
          {children}
        </h2>
      </div>
      <hr className=" visible flex-1" />
    </div>
  );
};

export default HeaderLined;
