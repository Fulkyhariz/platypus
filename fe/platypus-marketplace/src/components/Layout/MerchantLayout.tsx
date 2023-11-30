import React, { useEffect, useState } from "react";
import Footer from "../Footer/Footer";
import { ModeToggle } from "../ui/toggle-mode";
import { ThemeProvider } from "../ui/theme-provider";
import Link from "next/link";
import { useRouter } from "next/router";
import LoadingScreen from "../Loading/LoadingScreen";
import UserNavigation from "../UserNavigation/UserNavigation";
import {
  LiaAddressCardSolid,
  LiaUserCogSolid,
  LiaWalletSolid,
} from "react-icons/lia";
import MerchantInformation from "./MerchantInformation";
import { useMerchant } from "@/store/merchant/useMerchant";

interface IMerchantLayout {
  children: React.ReactNode;
}

function MerchantLayout({ children }: IMerchantLayout) {
  const router = useRouter();
  const path = router.pathname.split("/");

  const [tabPosition, setTabPosition] = useState(
    path[1] === "merchant" && path[3] === undefined
      ? 0
      : path[3] === "products"
      ? 1
      : path[3] === "categories"
      ? 2
      : 3,
  );

  useEffect(() => {
    if (router.pathname === "/merchant/[name]") {
      setTabPosition(0);
    } else if (router.pathname.startsWith("/merchant/[name]/products")) {
      setTabPosition(1);
    } else if (router.pathname === "/merchant/[name]/categories") {
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

  const merchantData = useMerchant.use.merchant();

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <LoadingScreen />
      <div className={`relative flex min-h-screen flex-col`}>
        <div className="fixed bottom-5 right-5 z-[50] rounded-lg bg-background">
          <ModeToggle />
        </div>
        <div>
          <UserNavigation />
          <div className="min-w-screen flex min-h-screen flex-col gap-3 pt-12 md:px-28 md:pt-[123px] 2xl:px-72">
            <MerchantInformation />
            <div className="mb-3 h-full w-full overflow-hidden rounded-lg">
              <ul className="font-base flex h-fit w-full overflow-x-auto border-b-[1px] border-border bg-background lg:h-12 lg:font-bold">
                <div className="relative flex w-full lg:min-w-[48rem]">
                  <div
                    className={`absolute bottom-0 left-0 h-full w-[33.3333%] border-b-2 border-primary transition duration-300`}
                    style={{ transform: `translateX(${tabPosition * 100}%)` }}
                  ></div>
                  <Link
                    href={`/merchant/${merchantData?.user_name}`}
                    onClick={() => onChangeTab(0)}
                    className={`${
                      tabPosition === 0 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-3 text-xs lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[1.5rem] min-w-[1.5rem] lg:hidden">
                      <LiaUserCogSolid className=" h-full w-full" />
                    </div>
                    Generals
                  </Link>
                  <Link
                    href={`/merchant/${merchantData?.user_name}/products/all`}
                    onClick={() => onChangeTab(1)}
                    className={`${
                      tabPosition === 1 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-3 text-xs lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[1.5rem] min-w-[1.5rem] lg:hidden">
                      <LiaAddressCardSolid className=" h-full w-full" />
                    </div>
                    Products
                  </Link>
                  <Link
                    href={`/merchant/${merchantData?.user_name}/categories`}
                    onClick={() => onChangeTab(2)}
                    className={`${
                      tabPosition === 2 && " text-primary"
                    } flex w-full flex-col items-center justify-center py-3 text-xs lg:flex-row lg:py-0 lg:text-base`}
                  >
                    <div className=" min-h-[1.5rem] min-w-[1.5rem] lg:hidden">
                      <LiaWalletSolid className=" h-full w-full" />
                    </div>
                    Category
                  </Link>
                </div>
              </ul>
              <div className="w-full">{children}</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default MerchantLayout;
