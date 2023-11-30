import React, { useEffect, useState } from "react";
import TopNavigation from "./TopNavigation/TopNavigation";
import { IoClose } from "react-icons/io5";
import { useUser } from "@/store/user/useUser";
import UserMiniCard from "../Card/UserMiniCard";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { deleteCookie, getCookie } from "cookies-next";
import service from "@/services/services";
import MerchantMiniCard from "../Card/MerchantMiniCard";

function UserNavigation() {
  const { getUserData, getWalletData, getUserAddresses } = useUser.getState();
  const [asideHide, setAsideHide] = useState(true);
  const userData = useUser.use.userData();
  const router = useRouter();
  const accesToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");

  const toggleAside = () => {
    setAsideHide(!asideHide);
  };

  const handleLogout = async () => {
    deleteCookie("accessToken", { path: "/" });
    deleteCookie("refreshToken", { path: "/" });
    router.push("/login");
    await service.postLogout();
  };

  useEffect(() => {
    if (accesToken && refreshToken) {
      getUserData();
      getWalletData();
      getUserAddresses();
    }
  }, []);

  return (
    <>
      <TopNavigation toggleAside={toggleAside} />
      <div
        className={`fixed left-0 top-0 z-[150] flex h-[100vh] w-[100vw] flex-col gap-3 transition-transform duration-500 
      ${
        asideHide
          ? "translate-y-full bg-background lg:hidden"
          : "translate-y-0 bg-background lg:hidden"
      }`}
      >
        <div className="flex flex-row-reverse items-center justify-between border-b-[1px] border-border p-3 px-5">
          <IoClose
            className="h-5 w-5 cursor-pointer hover:text-primary"
            onClick={toggleAside}
          />
          <p className="text-xl font-bold">Main Menu</p>
        </div>
        {userData ? (
          <div className="flex h-screen flex-col justify-between p-3 px-5">
            <div className="space-y-3">
              <UserMiniCard
                onClick={() => router.push("/user")}
                variant={"default"}
                className="w-full"
              />
              <MerchantMiniCard
                onClick={() => router.push("/merchant-center")}
                variant={"default"}
                className="w-full"
              />
            </div>
            <div className=" space-y-3">
              <Button onClick={handleLogout} className="w-full">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-end justify-end gap-3 px-5">
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
              variant={"secondary"}
            >
              Login
            </Button>
            <Button onClick={() => router.push("/register")} className="w-full">
              Register
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default UserNavigation;
