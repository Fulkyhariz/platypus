import React from "react";

interface IPopOutButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const PopOutButton = ({
  children,
  type = "button",
  className,
  ...rest
}: IPopOutButton) => {
  return (
    <button
      type={type}
      className={`translate-x-0 rounded-full border-2 border-primary px-3 py-1 transition duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-white hover:shadow-huge-up hover:transition hover:duration-300 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default PopOutButton;
