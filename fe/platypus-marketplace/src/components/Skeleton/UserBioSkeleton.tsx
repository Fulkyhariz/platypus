import React from "react";
import { Skeleton } from "../ui/skeleton";

const UserBioSkeleton = () => {
  return (
    <div>
      <div className="flex items-center gap-3 py-5 lg:pt-0">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="flex space-x-5">
        <div className="w-32 space-y-5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="w-full space-y-5">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  );
};

export default UserBioSkeleton;
