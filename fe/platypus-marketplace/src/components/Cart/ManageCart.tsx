import { useCart } from "@/store/cart/useCart";
import { formatIDR } from "@/utils/formatIDR";
import React from "react";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { Skeleton } from "../ui/skeleton";
import { useModal } from "@/store/modal/useModal";
import { useUser } from "@/store/user/useUser";
import { useRouter } from "next/router";

export const ManageCart = () => {
  const { multiCartAmount, totalCost } = useCart();
  const { hideModalUpSlide } = useModal.getState();
  const defaultAddress = useUser.use.defaultAddress();
  const router = useRouter();

  if (!multiCartAmount) {
    return <Skeleton className={`lg:h-64 lg:w-64 xl:h-80 xl:w-80`} />;
  }

  return (
    <div className="flex h-full flex-col justify-between gap-3 p-3 lg:gap-5">
      <div className=" space-y-3 lg:space-y-5">
        <h3 className="font-bold text-primary">Shopping summary</h3>
        <div className="text-sm font-[300] ">
          <div className="flex justify-between">
            <p>{`Total price for (${multiCartAmount.length}) items`}</p>
            <p className="text-right">
              {totalCost ? formatIDR(parseInt(totalCost)) : "Rp0"}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t-[1px] border-border">
        <div className="flex justify-between py-3 font-bold">
          <p>{`Total price`}</p>
          <p className="text-right">
            {totalCost ? formatIDR(parseInt(totalCost)) : "Rp0"}
          </p>
        </div>
        <ButtonWithLoading
          onClick={() => {
            router.push("/cart/checkout");
            hideModalUpSlide();
          }}
          disabled={defaultAddress ? false : true}
          buttonContent={defaultAddress ? "Summary" : "Add address first"}
          className="w-full"
        />
        {!defaultAddress && (
          <ButtonWithLoading
            onClick={() => {
              router.push("/user/address");
              hideModalUpSlide();
            }}
            variant="destructive"
            buttonContent={"Go to address settings"}
            className="mt-3 w-full"
          />
        )}
        {}
      </div>
    </div>
  );
};
