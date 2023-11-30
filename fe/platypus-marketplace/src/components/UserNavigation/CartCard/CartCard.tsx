import React, { useEffect } from "react";
import { RiShoppingBag2Fill } from "react-icons/ri";
import CartList from "./CartList";
import Link from "next/link";
import { useCart } from "@/store/cart/useCart";
const CartCard = () => {
  const { multiCartAmount, getInitialValue } = useCart();

  useEffect(() => {
    getInitialValue();
  }, []);

  return (
    <div className="z-[200] w-[20rem] md:w-[30rem]">
      {multiCartAmount ? (
        <div>
          <div className="flex justify-between">
            <p>{`Keranjang (${multiCartAmount.length})`}</p>
            <Link href={"/cart"} className="font-bold text-primary">
              Lihat Semua
            </Link>
          </div>
          <div className="mt-5 flex flex-col border-t-[1px] border-border">
            {multiCartAmount.slice(0, 5).map((cart) => (
              <CartList key={cart.cart_product_id} cart={cart} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div>
            <RiShoppingBag2Fill />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartCard;
