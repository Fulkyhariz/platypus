import { useCart } from "@/store/cart/useCart";
import { useModal } from "@/store/modal/useModal";
import { formatIDR } from "@/utils/formatIDR";
import React, { useState } from "react";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { ICheckOutPayload, ISingleCartPayload } from "@/interfaces/checkout";
import { useUser } from "@/store/user/useUser";
import WalletPinValidateCheckoutForm from "../Form/WalletPinValidateCheckoutForm";
import Promos from "./Promos";
import UserPlatypayData from "../Layout/UserSideBar/UserPlatypayData";
import { BiSolidDiscount } from "react-icons/bi";
import { Badge } from "../ui/badge";

export const ManageCheckOut = () => {
  const { showModal } = useModal.getState();
  const {
    multiCartAmount,
    totalCost,
    groupedCart,
    cartId,
    checkedCost,
    promoGlobal,
    promoMerchant,
    promoProduct,
  } = useCart();
  const defaultAddress = useUser.use.defaultAddress();
  const [chosenPromo, setChosenPromo] = useState<number>();

  let totalCourierCost = groupedCart.reduce((total, merchant) => {
    return total + merchant.courier_cost;
  }, 0);

  if (!multiCartAmount || !defaultAddress) {
    return <Skeleton className={`lg:h-64 lg:w-64 xl:h-80 xl:w-80`} />;
  }

  const filteredMerchant: ISingleCartPayload[] = groupedCart.map((group) => ({
    merchant_id: group.merchant_id,
    courier_id: group.courier_select,
    courier_price: String(group.courier_cost),
  }));

  let checkOutPayload: ICheckOutPayload = {
    cart_id: cartId,
    address_id: defaultAddress[0].id,
    merchant: filteredMerchant,
  };

  const onShowPromoModal = () => {
    showModal(
      <Promos
        checkPricePayload={checkOutPayload}
        setChosenPromo={setChosenPromo}
      />,
    );
  };

  const onCheckOutCart = async () => {
    if (chosenPromo) {
      checkOutPayload.voucher_id = chosenPromo;
    }
    showModal(
      <WalletPinValidateCheckoutForm checkOutPayload={checkOutPayload} />,
    );
  };

  return (
    <div className="flex h-full flex-col justify-between gap-3 p-3 lg:gap-5">
      <div className=" space-y-3 lg:space-y-5">
        <button
          disabled={groupedCart.some((cart) => cart.courier_cost === 0)}
          onClick={onShowPromoModal}
          className="w-full rounded-lg border-[1px] border-border p-3 shadow-md transition-colors hover:border-primary hover:bg-primary/10 hover:transition-colors disabled:bg-muted disabled:hover:border-muted"
        >
          {groupedCart.some((cart) => cart.courier_cost === 0) ? (
            "Select all courier service fist before choosing promos"
          ) : (
            <>
              <p>Save even more by using promos</p>
              <p className="font-bold text-primary">Select Promo</p>
            </>
          )}
        </button>
        <UserPlatypayData />
        {promoProduct && (
          <div className="rounded-lg border-[1px] border-primary p-3 text-xs">
            <p>You Applied Product Promo Type</p>
            <p className="line-clamp-1 font-medium text-primary">
              {promoProduct.product_name}
            </p>
            {promoProduct.discount && (
              <div className="mt-1 flex flex-row-reverse items-center">
                <Badge>
                  <BiSolidDiscount className="text-white" />
                  {parseFloat(promoProduct.discount) * 100}%
                </Badge>
              </div>
            )}
            {promoProduct.cut_price && (
              <p className="text-right">{formatIDR(promoProduct.cut_price)}</p>
            )}
          </div>
        )}
        {promoMerchant && (
          <div className="rounded-lg border-[1px] border-primary p-3 text-xs">
            <p>You Applied Merchant Promo Type</p>
            <p className="line-clamp-1 font-medium text-primary">
              Merchant Id: {promoMerchant.merchant_id}
            </p>
            {promoMerchant.discount && (
              <div className="mt-1 flex flex-row-reverse items-center">
                <Badge>
                  <BiSolidDiscount className="text-white" />
                  {parseFloat(promoMerchant.discount) * 100}%
                </Badge>
              </div>
            )}
            {promoMerchant.cut_price && (
              <p className="text-right">{formatIDR(promoMerchant.cut_price)}</p>
            )}
          </div>
        )}
        {promoGlobal && (
          <div className="rounded-lg border-[1px] border-primary p-3 text-xs">
            <p>You Applied Global Promo Type</p>
            {promoGlobal.discount && (
              <div className="mt-1 flex flex-row-reverse items-center">
                <Badge>
                  <BiSolidDiscount className="text-white" />
                  {parseFloat(promoGlobal.discount) * 100}%
                </Badge>
              </div>
            )}
            {promoGlobal.cut_price && (
              <p className="text-right">{formatIDR(promoGlobal.cut_price)}</p>
            )}
          </div>
        )}
        <h3 className="font-bold text-primary">Shopping summary</h3>
        {checkedCost ? (
          <div className="space-y-1 text-sm font-[300]">
            {checkedCost.merchant.map((group) => {
              return (
                <>
                  {group.CheckPriceProducts.map((product) => (
                    <div key={product.product_id} className="flex">
                      <div className="line-clamp-1 flex-[1.5]">
                        <p className="line-clamp-1">{product.product_name}</p>
                      </div>
                      <div className="flex-1">
                        <p
                          className={`${
                            product.cutted_price &&
                            "text-muted-foreground line-through decoration-primary"
                          } line-clamp-1 text-right`}
                        >
                          {formatIDR(
                            product.initial_price
                              ? product.initial_price
                              : product.total_price,
                          )}
                        </p>
                        {product.cutted_price && (
                          <p className="line-clamp-1 text-right">
                            {formatIDR(product.cutted_price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="jut flex border-b-[1px] border-border pb-1">
                    <div className="line-clamp-1 flex-[1.5]">
                      <p className="line-clamp-1 font-medium">Sub total</p>
                    </div>
                    <div className="flex-1 text-right font-medium">
                      <p
                        className={`${
                          group.cutted_price
                            ? "text-muted-foreground line-through decoration-primary"
                            : null
                        }`}
                      >
                        {group.initial_price
                          ? formatIDR(group.initial_price)
                          : formatIDR(group.total_price)}
                      </p>
                      {group.cutted_price && (
                        <p>{formatIDR(group.cutted_price)}</p>
                      )}
                    </div>
                  </div>
                </>
              );
            })}
            {checkedCost.merchant.map((group, i) => {
              if (group.ongkir) {
                return (
                  <div key={group.merchant_id} className="flex justify-between">
                    <p className=" line-clamp-1 flex-[1.5]">
                      <span className="font-medium">
                        ({groupedCart[i].courier_select.toUpperCase()}){" "}
                        {groupedCart[i].total_weight / 1000}kg
                      </span>{" "}
                      {groupedCart[i].merchant_name}
                    </p>
                    <p className="line-clamp-1 flex-1 text-right">
                      {formatIDR(group.ongkir)}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          <div className="space-y-1 text-sm font-[300]">
            {groupedCart.map((group) => {
              return (
                <>
                  {group.cart.map((cart) => (
                    <div key={cart.product_id} className="flex">
                      <p className="line-clamp-1 flex-[1.5]">{cart.title}</p>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-right">
                          {formatIDR(cart.price * cart.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="jut flex border-b-[1px] border-border pb-1">
                    <div className="line-clamp-1 flex-[1.5]">
                      <p className="line-clamp-1 font-medium">Sub total</p>
                    </div>
                    <div className="flex-1 text-right font-medium">
                      {formatIDR(group.total_cost)}
                    </div>
                  </div>
                </>
              );
            })}
            <div className="flex justify-between font-medium">
              <p className="line-clamp-1 flex-[1.5]">{`Total price for (${multiCartAmount.length}) items`}</p>
              <p className="line-clamp-1 flex-1 text-right">
                {totalCost ? formatIDR(parseInt(totalCost)) : "Rp0"}
              </p>
            </div>
            {totalCourierCost ? (
              <>
                <hr />
                {groupedCart.map((group) => {
                  if (group.courier_cost) {
                    return (
                      <div
                        key={group.merchant_id}
                        className="flex justify-between"
                      >
                        <p className=" line-clamp-1 flex-[1.5]">
                          <span className="font-medium">{`(${group.courier_select.toUpperCase()}) ${
                            group.total_weight / 1000
                          }kg `}</span>
                          {`${group.merchant_name}`}
                        </p>
                        <p className="line-clamp-1 flex-1 text-right">
                          {formatIDR(group.courier_cost)}
                        </p>
                      </div>
                    );
                  }
                })}
                <hr />
                <div className="flex justify-between font-medium">
                  <p className="line-clamp-1 flex-[1.5]">{`Total courier cost`}</p>
                  <p className="line-clamp-1 flex-1 text-right">
                    {formatIDR(totalCourierCost)}
                  </p>
                </div>
                <hr />
              </>
            ) : null}
          </div>
        )}
      </div>
      <div className="border-t-[1px] border-border">
        {checkedCost ? (
          <div className="flex justify-between py-3 font-bold">
            <p>{`Total price`}</p>
            <div>
              <p
                className={`${
                  checkedCost.cutted_price
                    ? "text-muted-foreground line-through decoration-primary"
                    : null
                } text-right`}
              >
                {checkedCost.initial_price
                  ? formatIDR(parseInt(checkedCost.initial_price))
                  : formatIDR(parseInt(checkedCost.total_price))}
              </p>
              {checkedCost.cutted_price && (
                <p className="text-right">
                  {checkedCost.cutted_price
                    ? formatIDR(parseInt(checkedCost.cutted_price))
                    : "Rp0"}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-between py-3 font-bold">
            <p>{`Total price`}</p>
            <p className="text-right">
              {totalCost
                ? formatIDR(parseInt(totalCost) + totalCourierCost)
                : "Rp0"}
            </p>
          </div>
        )}
        <Link href={"/cart/checkout"}>
          <ButtonWithLoading
            onClick={onCheckOutCart}
            type="button"
            disabled={
              groupedCart.some((cart) => cart.courier_cost === 0) ||
              multiCartAmount.length === 0
            }
            buttonContent={
              groupedCart.some((cart) => cart.courier_cost === 0)
                ? "Select Courier Service"
                : "Checkout"
            }
            className="w-full"
          />
        </Link>
      </div>
    </div>
  );
};
