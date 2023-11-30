import { ButtonHTMLAttributes, FC } from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    React.ClassAttributes<HTMLButtonElement> {
  name: string;
}

const GoogleButton: FC<GoogleButtonProps> = ({
  name,
  children,
  ...rest
}: GoogleButtonProps) => {
  return (
    <button
      className="flex w-full items-center justify-center space-x-3 rounded-full p-3 text-sm shadow-drop-line transition-shadow hover:shadow-drop-line-lg hover:transition-shadow"
      name={name}
      {...rest}
    >
      <FcGoogle className="mx-2 h-5 w-5" />
      {children && children}
    </button>
  );
};

export default GoogleButton;
