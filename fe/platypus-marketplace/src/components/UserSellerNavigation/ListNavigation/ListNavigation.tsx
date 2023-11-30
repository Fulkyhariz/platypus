import Link from "next/link";
import React from "react";
import style from "./ListNavigation.module.scss";
import classNames from "classnames";

interface IList {
  name: string;
  icon: React.ReactNode;
  isActive?: boolean;
  to: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const ListNavigation = ({ name, icon, isActive, to, onClick }: IList) => {
  const linkContainerClasses = classNames(style.linkContainer, {
    [style.unactiveList]: !isActive,
    [style.activeList]: isActive,
  });
  return (
    <Link
      onClick={onClick && onClick}
      className={`${linkContainerClasses} dark:text-secondary-foreground dark:hover:bg-primary/30 dark:hover:text-primary`}
      href={to}
    >
      <div className="text-xl ">{icon}</div>
      <p className=" line-clamp-1">{name}</p>
    </Link>
  );
};

export default ListNavigation;
