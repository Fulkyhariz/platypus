import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/store/user/useUser";
import UserPlatypayData from "./UserPlatypayData";
import { generateInitialName } from "@/utils/generator";
import { Skeleton } from "@/components/ui/skeleton";

const UserSideBar = () => {
  const userData = useUser.use.userData();

  if (!userData) {
    return <Skeleton className="h-16 w-full" />;
  }
  return (
    <aside className="w-[25rem] max-lg:hidden">
      <div className="space-y-3 rounded-lg border-border bg-background p-5 shadow-drop-line-sm dark:border-[1px]">
        <div className="flex gap-3 rounded-lg border-[1px] border-primary px-3 py-2">
          <Avatar>
            <AvatarImage
              className=" object-cover"
              src={userData?.profile_picture}
            />
            <AvatarFallback>
              {generateInitialName(userData.first_name, userData.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <p className="line-clamp-1 text-sm font-bold">
              {userData?.first_name} {userData?.last_name}
            </p>
            <p className="line-clamp-1 text-xs">{userData?.email}</p>
          </div>
        </div>
        <UserPlatypayData />
      </div>
    </aside>
  );
};

export default UserSideBar;
