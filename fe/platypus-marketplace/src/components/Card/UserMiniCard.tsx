import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useUser } from "@/store/user/useUser";
import { generateInitialName } from "@/utils/generator";
import { Skeleton } from "../ui/skeleton";

const userMiniCardVariant = cva(
  "flex hover:transition-colors gap-3 rounded-lg border-[1px] border-primary px-3 py-2 transition-colors hover:bg-primary/20",
  {
    variants: {
      variant: {
        default: "bg-background",
        destructive: "bg-destructive",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface IUserMiniCard
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof userMiniCardVariant> {}
{
}

const UserMiniCard = ({ className, variant, ...props }: IUserMiniCard) => {
  const userData = useUser.use.userData();

  if (!userData) {
    return <Skeleton className="h-16 w-full" />;
  }
  return (
    <div className={cn(userMiniCardVariant({ variant }), className)} {...props}>
      <Avatar>
        <AvatarImage
          className=" object-cover"
          src={`${userData.profile_picture}`}
        />
        <AvatarFallback>
          {generateInitialName(userData?.first_name, userData?.last_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col justify-center">
        <p className="line-clamp-1 text-sm font-bold">
          {userData?.first_name} {userData?.last_name}
        </p>
        <p className="line-clamp-1 text-xs">{userData?.email}</p>
      </div>
    </div>
  );
};

export default UserMiniCard;
