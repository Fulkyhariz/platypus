import PlatypusHead from "@/components/SVG/PlatypusHead";
import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { SlOptionsVertical } from "react-icons/sl";

interface ISellerSmallNavbar {
  toggleAside: () => void;
}

function SellerSmallNavbar({ toggleAside }: ISellerSmallNavbar) {
  return (
    <div className="fixed top-0 z-10 flex w-full items-center justify-between border-b-[0.5px] border-border bg-background px-5 py-5 lg:hidden">
      <GiHamburgerMenu
        className=" cursor-pointer text-xl text-secondary-foreground transition-colors hover:text-primary hover:transition-colors"
        onClick={toggleAside}
      />
      <PlatypusHead className="w-16" />
      <SlOptionsVertical className=" cursor-pointer text-xl text-secondary-foreground transition-colors hover:text-primary hover:transition-colors" />
    </div>
  );
}

export default SellerSmallNavbar;
