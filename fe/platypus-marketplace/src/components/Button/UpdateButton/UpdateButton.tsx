import classNames from "classnames";
import React, { ButtonHTMLAttributes, FC } from "react";
import styles from "./UpdateButton.module.scss";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    React.ClassAttributes<HTMLButtonElement> {
  name: string;
  component?: React.ReactNode;
  icon?: React.ReactNode;
  wmax?: boolean;
  cancel?: boolean;
  ship?: boolean;
  deliver?: boolean;
}

const UpdateButton: FC<ButtonProps> = ({
  name,
  component,
  icon,
  wmax,
  children,
  cancel,
  ship,
  deliver,
  disabled,
  ...rest
}) => {
  const updateButtonClassess = classNames([styles.updateButton], {
    [styles.cancelButton]: cancel && !disabled,
    [styles.shipButton]: ship && !disabled,
    [styles.deliverButton]: deliver && !disabled,
    [styles.updateButtonMax]: wmax,
    [styles.updateButtonDisabled]: disabled,
  });

  return (
    <button
      disabled={disabled}
      {...rest}
      name={name}
      className={`${updateButtonClassess} group  `}
    >
      <div className="absolute -bottom-1 -left-1 h-7 w-7 group-hover:animate-move_up">
        {icon && icon}
      </div>
      {children && children}
      {component && component}
      <div className="absolute -right-1 -top-1 h-7 w-7 rotate-180 group-hover:animate-move_down">
        {icon && icon}
      </div>
    </button>
  );
};

export default UpdateButton;
