import React from "react";
import styles from "./VariantButton.module.scss";
import classNames from "classnames";

interface IVariantButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const VariantButton = ({
  children,
  isActive,
  disabled = false,
  ...rest
}: IVariantButton) => {
  const variantButtonClasses = classNames(styles.variantButtonContainer, {
    [styles.inActive]: !isActive,
    [styles.active]: isActive,
    [styles.able]: !disabled,
    [styles.disable]: disabled,
  });
  return (
    <button disabled={disabled} className={variantButtonClasses} {...rest}>
      {children}
    </button>
  );
};

export default VariantButton;
