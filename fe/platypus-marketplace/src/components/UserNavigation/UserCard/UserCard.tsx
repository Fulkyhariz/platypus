import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import service from "@/services/services";
import { useUser } from "@/store/user/useUser";
import { deleteCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { LiaAddressCardSolid, LiaClipboardListSolid } from "react-icons/lia";
import { IoWalletOutline } from "react-icons/io5";
import UserPlatypayData from "@/components/Layout/UserSideBar/UserPlatypayData";
import { generateInitialName } from "@/utils/generator";

const UserCard = () => {
  const userData = useUser.use.userData();
  const router = useRouter();
  const handleLogout = async () => {
    await service.postLogout();
    deleteCookie("accessToken", { path: "/" });
    deleteCookie("refreshToken", { path: "/" });
    router.push("/login");
  };
  return (
    <div className="space-y-5">
      <Link
        href="/user"
        className="flex w-[17rem] cursor-pointer gap-3 rounded-lg border-[1px] border-primary px-3 py-2 transition-colors hover:bg-primary/10 hover:text-primary hover:transition-colors"
      >
        <Avatar>
          <AvatarImage
            className="object-cover"
            src={userData?.profile_picture}
            height={50}
            width={50}
          />
          <AvatarFallback>
            {generateInitialName(
              userData?.first_name as string,
              userData?.last_name as string,
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <p className="line-clamp-1 text-sm font-bold">
            {userData?.first_name} {userData?.last_name}
          </p>
          <p className="line-clamp-1 text-xs">{userData?.email}</p>
        </div>
      </Link>
      <ul className="flex w-full gap-3 text-sm">
        <div className="flex-1 border-r-[1px] border-primary">
          <ul className="space-y-3 pr-3">
            <li className="cursor-pointer rounded-lg border-[1px] border-transparent p-1 hover:border-primary hover:bg-primary/10 hover:text-primary">
              <Link href={"/user/address"} className="flex items-center gap-1">
                <LiaAddressCardSolid className="h-5 w-5" />
                Addresses
              </Link>
            </li>
            <li className="cursor-pointer rounded-lg border-[1px] border-transparent p-1 hover:border-primary hover:bg-primary/10 hover:text-primary">
              <Link href={"/user/platypay"} className="flex items-center gap-1">
                <IoWalletOutline className="h-5 w-5" />
                Platypay
              </Link>
            </li>
            <li className="cursor-pointer rounded-lg border-[1px] border-transparent p-1 hover:border-primary hover:bg-primary/10 hover:text-primary">
              <Link
                href={"/user/transactions"}
                className="flex items-center gap-1"
              >
                <LiaClipboardListSolid className="h-5 w-5" />
                Transactions
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex-1">
          <UserPlatypayData small />
        </div>
      </ul>
      <Button onClick={handleLogout} className="w-full">
        Logout
      </Button>
    </div>
  );
};

export default UserCard;
