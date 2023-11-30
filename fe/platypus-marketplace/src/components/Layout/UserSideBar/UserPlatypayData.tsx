import { useUser } from "@/store/user/useUser";
import { formatIDR } from "@/utils/formatIDR";
import Link from "next/link";
import React from "react";
import { IoWallet } from "react-icons/io5";

interface IUserPlatypayData {
  small?: boolean;
}

const UserPlatypayData = ({ small }: IUserPlatypayData) => {
  const walletData = useUser.use.walletData();

  if (!walletData) {
    return (
      <div className="flex gap-3 rounded-lg border-[1px] border-primary px-3 py-2">
        <div className="flex min-h-fit min-w-fit items-center">
          <IoWallet className="h-10 w-10" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="line-clamp-1 text-sm font-bold">PlatyPay</p>
          <Link
            href="/user/platypay"
            className="animate-pulse text-sm transition hover:animate-none hover:text-primary hover:underline hover:transition"
          >
            Setup
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`${
        small ? "flex-col gap-1" : "gap-3"
      } flex rounded-lg border-[1px] border-primary px-3 py-2`}
    >
      <div className="flex min-h-fit min-w-fit items-center gap-3">
        <IoWallet className="h-7 w-7" />
        {small && <p className="line-clamp-1 text-sm font-bold">PlatyPay</p>}
      </div>
      <div className="flex flex-col justify-center">
        {small ? null : (
          <p className="line-clamp-1 text-sm font-bold">PlatyPay</p>
        )}
        <p className="line-clamp-1 text-xs">{formatIDR(walletData.balance)}</p>
      </div>
    </div>
  );
};

export default UserPlatypayData;
