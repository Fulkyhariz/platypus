import { IItemsAmount } from "@/interfaces/zustandStore";
import React from "react";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { formatIDR } from "@/utils/formatIDR";
import { FaRegTrashCan } from "react-icons/fa6";
import { useToast } from "../ui/use-toast";
import { useCart } from "@/store/cart/useCart";
import service from "@/services/services";
import Link from "next/link";

interface ICheckoutCard {
  itemAmount: IItemsAmount;
}

const CheckoutCard = ({ itemAmount }: ICheckoutCard) => {
  const { getInitialValue } = useCart();
  const { toast } = useToast();

  const onDeleteCart = async () => {
    const { error, data } = await service.deleteCart({
      cart_product_id: itemAmount.cart_product_id,
    });

    if (error) {
      toast({ title: data.message, variant: "destructive" });
    } else {
      toast({
        title: `${itemAmount.title} deleted from cart`,
        variant: "success",
      });
      getInitialValue();
    }
  };

  return (
    <div className="relative border-b-[1px] border-border py-3">
      <div className="flex gap-3">
        <Link
          href={`/detail/${itemAmount.product_id}`}
          className="aspect-square rounded-lg border-[1px] border-border"
        >
          <ImageWithFallback
            className="h-[90px] w-[90px] rounded-lg object-contain"
            alt={String(itemAmount.cart_product_id)}
            src={itemAmount.photo}
            width={90}
            height={90}
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between">
          <Link href={`/detail/${itemAmount.product_id}`}>
            <p className="line-clamp-1 font-bold text-primary lg:text-lg">
              {itemAmount.title}
              {itemAmount.variant === "" ? null : `, ${itemAmount.variant}`}
            </p>
          </Link>
          <p>
            {formatIDR(itemAmount.price)} x {itemAmount.amount}
          </p>
          <p>{itemAmount.weight / 1000}kg</p>
        </div>
        <div className="absolute bottom-3 right-0 flex items-center gap-3">
          <div>
            <FaRegTrashCan
              onClick={onDeleteCart}
              className="cursor-pointer transition-colors hover:text-primary hover:transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCard;
