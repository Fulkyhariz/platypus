// import useMultipleAmount from "@/store/amount/useMultipleAmount";
import { IItemsAmount } from "@/interfaces/zustandStore";
import { useCart } from "@/store/cart/useCart";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import useDebounce from "@/hooks/useDebounce";
import { FaMinus, FaPlus } from "react-icons/fa6";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { formatIDR } from "@/utils/formatIDR";
import { FaRegTrashCan } from "react-icons/fa6";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";

interface ICartCard {
  itemAmount: IItemsAmount;
}

const CartCard = ({ itemAmount }: ICartCard) => {
  const [amount, setAmount] = useState<number>(itemAmount.amount);
  const { setDirectMultiAmount, getInitialValue, multiCartAmount } = useCart();
  const { toast } = useToast();
  const debounchedAmount = useDebounce(amount, 1000);

  const onPlusAmount = () => {
    setAmount((prev) => prev + 1);
  };

  const onMinusAmount = () => {
    setAmount((prev) => prev - 1);
  };

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

  const onSetAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (itemAmount.stock) {
      if (parseInt(e.target.value) === 0) {
        setAmount(1);
      } else if (parseInt(e.target.value) > itemAmount.stock) {
        setAmount(itemAmount.stock);
      } else {
        setAmount(parseInt(e.target.value));
      }
    } else {
      if (isNaN(parseInt(e.target.value)) || parseInt(e.target.value) === 0) {
        setAmount(1);
      } else {
        setAmount(parseInt(e.target.value));
      }
    }
  };

  useEffect(() => {
    if (!isNaN(amount) || debounchedAmount) {
      setDirectMultiAmount(
        itemAmount.cart_product_id,
        debounchedAmount,
        itemAmount.stock,
        multiCartAmount,
      );
    }
  }, [debounchedAmount]);

  return (
    <div className="relative border-b-[1px] border-border py-3">
      <div className="flex gap-3">
        <div className="aspect-square rounded-lg border-[1px] border-border">
          <ImageWithFallback
            className="h-[90px] w-[90px] rounded-lg object-contain"
            alt={String(itemAmount.cart_product_id)}
            src={itemAmount.photo}
            width={90}
            height={90}
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <p className="line-clamp-1 font-bold text-primary lg:text-lg">
            {itemAmount.title}
            {itemAmount.variant === "" ? null : `, ${itemAmount.variant}`}
          </p>
          <p>
            {formatIDR(itemAmount.price)} | {itemAmount.weight / 1000}kg
          </p>
          <p>{`Stock product: ${itemAmount.stock}`}</p>
        </div>
      </div>
      <div className="absolute bottom-3 right-0 flex w-32 items-center gap-3 max-lg:static max-lg:mt-3 max-lg:w-full max-lg:justify-center">
        <div>
          <FaRegTrashCan
            onClick={onDeleteCart}
            className="cursor-pointer transition-colors hover:text-primary hover:transition-colors"
          />
        </div>
        <div className="relative">
          <Input
            onKeyDown={(evt) =>
              ["e", "E", "+", "-", "."].includes(evt.key) &&
              evt.preventDefault()
            }
            type="number"
            value={amount}
            onChange={(e) => onSetAmount(e)}
            className="px-  5 text-center"
          />
          <button
            disabled={amount === 1 || isNaN(amount)}
            className="absolute left-0 top-0 h-full px-3 transition-colors hover:text-primary hover:transition-colors disabled:text-slate-300"
            onClick={onMinusAmount}
          >
            <FaMinus />
          </button>
          <button
            disabled={amount === itemAmount.stock || isNaN(amount)}
            className=" absolute right-0 top-0 h-full px-3 transition-colors hover:text-primary hover:transition-colors disabled:text-slate-300"
            onClick={onPlusAmount}
          >
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
