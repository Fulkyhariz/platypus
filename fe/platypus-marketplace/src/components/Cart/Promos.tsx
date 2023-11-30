/*eslint no-unused-vars: "off"*/

import { ICheckOutPayload, ICheckPrice, IPromos } from "@/interfaces/checkout";
import service from "@/services/services";
import React, { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { MdOutlineDiscount } from "react-icons/md";
import { useToast } from "../ui/use-toast";
import { ICheckPriceResponse } from "@/interfaces/zustandStore";
import { useCart } from "@/store/cart/useCart";
import { useModal } from "@/store/modal/useModal";

interface IPromosPayload {
  checkPricePayload: ICheckOutPayload;
  setChosenPromo: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const Promos = ({ checkPricePayload, setChosenPromo }: IPromosPayload) => {
  const [promos, setPromos] = useState<IPromos[]>();
  const { hideModal } = useModal.getState();
  const { toast } = useToast();
  const {
    setPromoGlobal,
    setPromoMerchant,
    setPromoProduct,
    setNewTotalCost,
    setNewMerchantPrice,
    resetNewMerchantPrice,
    setNewTotalAllMerchant,
    setCheckedPrice,
  } = useCart();
  useEffect(() => {
    const getPromos = async () => {
      const { error, data } = await service.getPromos();

      setPromos(data.data);

      if (error) {
        toast({ title: data.message, variant: "destructive" });
      }
    };

    getPromos();
  }, []);

  const onCheckPrice = async (voucherId: number, index: number) => {
    const checkPricePayloadWithId: ICheckPrice = {
      ...checkPricePayload,
      voucher_id: voucherId,
    };

    const { error, data } = await service.postCheckPrice(
      checkPricePayloadWithId,
    );

    const promo = data.data as ICheckPriceResponse;
    if (error) {
      toast({ title: data.message, variant: "destructive" });
    } else {
      setCheckedPrice(promo);
      toast({
        title: "Promo applied",
        variant: "success",
        description: promos![index].name,
      });
      setChosenPromo(voucherId);
      if (promo.cut_price || promo.discount) {
        setPromoGlobal(promo);
        setPromoMerchant(undefined);
        setPromoProduct(undefined);
        setNewTotalCost(promo.total_price);
        resetNewMerchantPrice();
      }

      if (promo.merchant && promo.merchant.length > 0) {
        let totalCourierPrice = 0;
        let totalAllMercantCost = 0;
        promo.merchant.forEach((merchant) => {
          totalAllMercantCost += parseInt(merchant.total_price);
          totalCourierPrice += parseInt(merchant.ongkir);
          if (merchant.cut_price || merchant.discount) {
            setPromoMerchant(merchant);
            setPromoGlobal(undefined);
            setPromoProduct(undefined);
            setNewTotalAllMerchant(String(totalAllMercantCost));
            setNewMerchantPrice(
              merchant.merchant_id,
              String(merchant.cutted_price),
            );
            setNewTotalCost(promo.total_price);
          }

          if (
            merchant.CheckPriceProducts &&
            merchant.CheckPriceProducts.length > 0
          ) {
            merchant.CheckPriceProducts.forEach((product) => {
              if (product.cut_price || product.discount) {
                setPromoProduct(product);
                setPromoMerchant(undefined);
                setPromoGlobal(undefined);
                setNewTotalAllMerchant(String(totalAllMercantCost));
                resetNewMerchantPrice();
                setNewTotalCost(promo.total_price);
              }
            });
          }
        });
      }

      hideModal();
    }
  };

  if (!promos) {
    return (
      <div className="grid max-h-[80%] grid-cols-2 gap-3 overflow-y-scroll p-5">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="max-h-[80%] overflow-y-scroll" id="checkout-promos">
      {promos.length === 0 ? (
        <p>There are no active promotions for the current period</p>
      ) : (
        <div className="grid w-full grid-cols-2 gap-3 p-3">
          {promos.map((promo, i) => (
            <button
              type="button"
              onClick={() => onCheckPrice(promo.id, i)}
              className="relative w-full max-w-[250px] cursor-pointer rounded-lg border-[1px] border-border p-3 font-bold shadow-md transition hover:border-primary hover:bg-primary/20 hover:text-primary hover:transition"
              key={promo.id}
            >
              <MdOutlineDiscount className="absolute -right-3 -top-2 h-5 w-5 -rotate-90 text-primary" />
              <p className="line-clamp-2">{promo.name.toUpperCase()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Promos;
