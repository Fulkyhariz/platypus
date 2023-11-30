import React from "react";

interface ILabeledContainer {
  label?: string;
  content: string | React.ReactNode;
  lineClamp?: boolean;
}

const LabeledContainer = ({ label, content, lineClamp }: ILabeledContainer) => {
  return (
    <div className="relative my-3 rounded-lg border-[1px] border-primary p-3">
      {label && (
        <p className="absolute -top-[0.625rem] bg-background px-1 text-xs">
          {label}
        </p>
      )}
      <div className={`${lineClamp && `line-clamp-2`}`}>{content}</div>
    </div>
  );
};

export default LabeledContainer;
