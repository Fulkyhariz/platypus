import { ButtonHTMLAttributes, FC } from "react";

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    React.ClassAttributes<HTMLButtonElement> {
  name: string;
  component?: React.ReactNode;
}

const IconButton: FC<IconButtonProps> = ({
  name,
  component,
  children,
  ...rest
}: IconButtonProps) => {
  return (
    <button
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-primary/20 hover:text-primary"
      name={name}
      {...rest}
    >
      {children && children}
      {component && component}
    </button>
  );
};

export default IconButton;
