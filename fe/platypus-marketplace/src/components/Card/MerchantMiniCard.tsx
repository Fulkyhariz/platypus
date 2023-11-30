import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useUser } from "@/store/user/useUser";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { Button } from "../ui/button";
import PlatypusHead from "../SVG/PlatypusHead";

const MerchantMiniCardVariant = cva(
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

interface IMerchantMiniCard
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof MerchantMiniCardVariant> {}
{
}

const MerchantMiniCard = ({
  className,
  variant,
  ...props
}: IMerchantMiniCard) => {
  const userData = useUser.use.userData();

  if (!userData) {
    return <Skeleton className="h-16 w-full" />;
  }
  return (
    <>
      {userData.is_seller ? (
        <div
          className={cn(MerchantMiniCardVariant({ variant }), className)}
          {...props}
        >
          {/* <Avatar>
            <AvatarImage src={`${userData.profile_picture}`} />
            <AvatarFallback>
              {generateInitialName(userData?.first_name, userData?.last_name)}
            </AvatarFallback>
          </Avatar> */}
          <PlatypusHead className="h-10 w-10" />
          <div className="flex flex-col justify-center text-xs">
            <p className="line-clamp-1">{userData?.username}</p>
            <p className="font-bold text-primary">Goto Merchant Center</p>
          </div>
        </div>
      ) : (
        <Link href="/register/merchant">
          <Button className="w-full">Register Merchant</Button>
        </Link>
      )}
    </>
  );
};

export default MerchantMiniCard;
