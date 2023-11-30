import React, { useEffect, useState } from "react";
import UserNavigation from "../UserNavigation/UserNavigation";
import Footer from "../Footer/Footer";
import { ModeToggle } from "../ui/toggle-mode";
import { ThemeProvider } from "../ui/theme-provider";
import Link from "next/link";
import { useRouter } from "next/router";
import LoadingScreen from "../Loading/LoadingScreen";
import UserSideBar from "./UserSideBar/UserSideBar";
import {
  LiaUserCogSolid,
  LiaAddressCardSolid,
  LiaClipboardListSolid,
} from "react-icons/lia";
import { IoWalletOutline } from "react-icons/io5";

interface IUserSettingsLayout {
  children: React.ReactNode;
}

function UserSettingsLayout({ children }: IUserSettingsLayout) {
  const router = useRouter();

  const [tabPosition, setTabPosition] = useState(
    router.pathname === "/user"
      ? 0
      : router.pathname === "/user/address"
      ? 1
      : router.pathname === "/user/platypay"
      ? 2
      : router.pathname === "/user/transactions"
      ? 3
      : 4,
  );

  useEffect(() => {
    if (router.pathname === "/user") {
      setTabPosition(0);
    } else if (router.pathname === "/user/address") {
      setTabPosition(1);
    } else if (router.pathname === "/user/platypay") {
      setTabPosition(2);
    } else {
      setTabPosition(3);
    }
  }, [router.pathname]);

  const onChangeTab = (position: number) => {
    if (position === 0) {
      setTabPosition(0);
    } else if (tabPosition === position) {
      setTabPosition(position);
    } else if (tabPosition > position) {
      setTabPosition(position);
    } else {
      let move = position - tabPosition;
      setTabPosition((prev) => prev + move);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <LoadingScreen />
      <div className={`relative flex min-h-screen flex-col`}>
        <div className="fixed bottom-5 right-5 z-[50] rounded-lg bg-background">
          <ModeToggle />
        </div>
        <div>
          <UserNavigation />
          <div className="min-w-screen flex min-h-screen gap-3 pb-10 pt-14 md:pt-[7.5rem] lg:pt-40 2xl:px-72">
            <UserSideBar />
            <div className="h-full w-full overflow-hidden rounded-lg border-[1px] border-border">
              <ul className="font-base flex h-fit w-full overflow-x-auto border-b-[1px] border-border bg-background lg:h-12 lg:font-bold">
                <div className="relative flex w-full lg:min-w-[48rem]">
                  <div
                    className={`absolute bottom-0 left-0 h-full w-[25%] border-b-2 border-primary bg-primary/20 transition duration-300 lg:max-w-[12rem]`}
                    style={{ transform: `translateX(${tabPosition * 100}%)` }}
                  ></div>
                  <Link
                    href={"/user"}
                    onClick={() => onChangeTab(0)}
                    className={`${
                      tabPosition === 0 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-1 text-xs lg:max-w-[12rem] lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[2rem] min-w-[2rem] lg:hidden">
                      <LiaUserCogSolid className=" h-full w-full" />
                    </div>
                    Biodata
                  </Link>
                  <Link
                    href={"/user/address"}
                    onClick={() => onChangeTab(1)}
                    className={`${
                      tabPosition === 1 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-1 text-xs lg:max-w-[12rem] lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[2rem] min-w-[2rem] lg:hidden">
                      <LiaAddressCardSolid className=" h-full w-full" />
                    </div>
                    Address
                  </Link>
                  <Link
                    href={"/user/platypay"}
                    onClick={() => onChangeTab(2)}
                    className={`${
                      tabPosition === 2 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-1 text-xs lg:max-w-[12rem] lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[2rem] min-w-[2rem] lg:hidden">
                      <IoWalletOutline className=" h-full w-full" />
                    </div>
                    PlatyPay
                  </Link>
                  <Link
                    href={"/user/transactions"}
                    onClick={() => onChangeTab(3)}
                    className={`${
                      tabPosition === 3 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-1 text-xs lg:max-w-[12rem] lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[2rem] min-w-[2rem] lg:hidden">
                      <LiaClipboardListSolid className=" h-full w-full" />
                    </div>
                    Transactions
                  </Link>
                </div>
              </ul>
              <div className="h-fit max-h-screen w-full overflow-y-scroll p-5 lg:h-fit lg:py-10">
                {children}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default UserSettingsLayout;
