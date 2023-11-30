import React from "react";
import SellerSideBar from "../UserSellerNavigation/SellerSideBar/SellerSideBar";
import { ModeToggle } from "../ui/toggle-mode";
import { ThemeProvider } from "../ui/theme-provider";
import LoadingScreen from "../Loading/LoadingScreen";

interface IUserSellerLayout {
  children: React.ReactNode;
}

function UserSellerLayout({ children }: IUserSellerLayout) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <LoadingScreen />
      <div className={` flex min-h-screen `}>
        <div className="fixed bottom-5 right-5 z-[100]">
          <ModeToggle />
        </div>
        <SellerSideBar />
        <div className="w-full bg-secondary">{children}</div>
      </div>
    </ThemeProvider>
  );
}

export default UserSellerLayout;
