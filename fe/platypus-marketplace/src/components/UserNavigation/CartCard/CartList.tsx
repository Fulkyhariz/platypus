import {
  AvatarImage,
  AvatarFallback,
  AvatarFullSizeNoRound,
} from "@/components/ui/avatar";
import { IItemsAmount } from "@/interfaces/zustandStore";
import { formatIDR } from "@/utils/formatIDR";
import React from "react";

interface ICartList {
  cart: IItemsAmount;
}

const CartList = ({ cart }: ICartList) => {
  return (
    <div className="group cursor-pointer p-3 transition-colors hover:bg-primary/20 hover:transition-colors">
      <div className="flex w-full justify-between gap-3">
        <div className="h-10 w-10">
          <AvatarFullSizeNoRound className="cursor-pointer">
            <AvatarImage src={cart.photo} />
            <AvatarFallback>CN</AvatarFallback>
          </AvatarFullSizeNoRound>
        </div>
        <div className="min-w-[8rem] flex-1">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold transition-colors hover:transition-colors group-hover:text-primary">
            {cart.title}
          </p>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
            {cart.amount} x ({cart.weight}/gram)
          </p>
        </div>
        <div className="flex max-w-[8rem] items-center">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {formatIDR(cart.price * cart.amount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartList;
