import React from "react";
import UserNavigation from "../UserNavigation/UserNavigation";
import Footer from "../Footer/Footer";
import { ModeToggle } from "../ui/toggle-mode";
import { ThemeProvider } from "../ui/theme-provider";
import LoadingScreen from "../Loading/LoadingScreen";

interface IUserLayout {
  children: React.ReactNode;
}

function UserLayout({ children }: IUserLayout) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <LoadingScreen />
      <div className={`relative flex min-h-screen flex-col  overflow-hidden`}>
        <div className="fixed bottom-5 right-5 z-[100]">
          <ModeToggle />
        </div>
        <UserNavigation />
        <div className="mb-10 w-full">{children}</div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default UserLayout;
