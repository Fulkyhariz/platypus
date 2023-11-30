import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/store/user/useUser";
import { generateInitialName } from "@/utils/generator";
import Link from "next/link";
import React from "react";

const MerchantCard = () => {
  const userData = useUser.use.userData();

  if (!userData) {
    return <Skeleton className="h-10 w-full" />;
  }
  return (
    <div className="space-y-5">
      {userData.is_seller ? (
        <Link
          href={"/merchant-center"}
          className="flex items-center gap-3 rounded-lg border-b-[1px] border-border p-3 hover:bg-primary/20"
        >
          <Avatar className="cursor-pointer">
            <AvatarImage
              className="object-cover"
              src={userData.profile_picture}
            />
            <AvatarFallback>
              {generateInitialName(userData.first_name, userData.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-primary">Merchant Center</p>
            <p>{userData.username}</p>
          </div>
        </Link>
      ) : (
        <Link href="/register/merchant">
          <Button className="w-full">Register Merchant</Button>
        </Link>
      )}
      <div>
        <h2 className="text-center text-xl font-bold text-primary">
          Platypus Merchant
        </h2>
      </div>
    </div>
  );
};

export default MerchantCard;
