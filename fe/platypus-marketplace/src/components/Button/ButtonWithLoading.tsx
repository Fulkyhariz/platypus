import { useLoading } from "@/store/loading/useLoading";
import { ReloadIcon } from "@radix-ui/react-icons";
import React from "react";
import { Button } from "../ui/button";

interface IButtonWithLoading
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonContent?: React.ReactNode;
  loadingContent?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

const ButtonWithLoading = ({
  buttonContent,
  loadingContent,
  children,
  type = "submit",
  variant = "default",
  disabled,
  ...rest
}: IButtonWithLoading) => {
  const looadingSm = useLoading.use.looadingSm();
  return (
    <>
      <Button
        variant={variant}
        disabled={looadingSm || disabled}
        type={type}
        {...rest}
      >
        {looadingSm ? (
          <>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            {loadingContent && loadingContent}
          </>
        ) : (
          <>{buttonContent && buttonContent}</>
        )}
        {children}
      </Button>
    </>
  );
};

export default ButtonWithLoading;
