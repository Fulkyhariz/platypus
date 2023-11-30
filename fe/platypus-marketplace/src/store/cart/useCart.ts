import { toast } from "@/components/ui/use-toast";
import {
  ICheckMerchantPrice,
  ICheckPriceProductsResponse,
  ICheckPriceResponse,
  IGroupedCart,
  IItemsAmount,
} from "@/interfaces/zustandStore";
import service from "@/services/services";
import { create } from "zustand";

type State = {
  multiCartAmount: IItemsAmount[];
  groupedCart: IGroupedCart[];
  cartId: number;
  totalCost: string;
  checkedCost: ICheckPriceResponse | undefined;
  newTotalCost: string;
  newTotalAllMerchantCost: string;
  newMerchantPrice: { id: number; price: string } | undefined;
  promoProduct: ICheckPriceProductsResponse | undefined;
  promoMerchant: ICheckMerchantPrice | undefined;
  promoGlobal: ICheckPriceResponse | undefined;
};

type Actions = {
  setDirectMultiAmount: (
    cardId: number,
    amount: number,
    maxIncrease: number,
    multiCartAmount: IItemsAmount[],
  ) => void;
  getInitialValue: () => void;
  setInitialMultiAmount: (initialMultiAmount: IItemsAmount[]) => void;
  setCourierCost: (
    amount: number,
    merchant_id: number,
    courierId: string,
  ) => void;
  setCheckedPrice: (price: ICheckPriceResponse | undefined) => void;
  setPromoProduct: (promo: ICheckPriceProductsResponse | undefined) => void;
  setPromoMerchant: (promo: ICheckMerchantPrice | undefined) => void;
  setPromoGlobal: (promo: ICheckPriceResponse | undefined) => void;
  setTotalCost: (cost: string) => void;
  setNewTotalCost: (cost: string) => void;
  setNewMerchantPrice: (id: number, price: string) => void;
  resetNewMerchantPrice: () => void;
  setNewTotalAllMerchant: (cost: string) => void;
};

function groupCartByMerchantId(cart: IItemsAmount[]): IGroupedCart[] {
  const groupedCart: Record<number, IGroupedCart> = {};

  cart.forEach((item) => {
    const {
      merchant_id,
      merchant_name,
      photo,
      city_id,
      weight,
      price,
      amount,
    } = item;

    if (!groupedCart[merchant_id]) {
      groupedCart[merchant_id] = {
        merchant_id,
        merchant_name,
        photo,
        city_id,
        total_weight: 0,
        total_cost: 0,
        courier_cost: 0,
        courier_select: "",
        cart: [],
      };
    }
    groupedCart[merchant_id].total_weight =
      groupedCart[merchant_id].total_weight + weight;
    groupedCart[merchant_id].total_cost =
      groupedCart[merchant_id].total_cost + parseInt(String(price * amount));
    groupedCart[merchant_id].cart.push(item);
  });

  return Object.values(groupedCart);
}

export const useCart = create<State & Actions>((set) => ({
  multiCartAmount: [],
  groupedCart: [],
  cartId: 0,
  totalCost: "",
  newTotalCost: "",
  newTotalAllMerchantCost: "",
  newMerchantPrice: undefined,
  promoProduct: undefined,
  promoMerchant: undefined,
  promoGlobal: undefined,
  checkedCost: undefined,
  setCheckedPrice: (price: ICheckPriceResponse | undefined) => {
    set(() => ({ checkedCost: price }));
  },
  setNewTotalAllMerchant: (cost: string) => {
    set(() => ({ newTotalAllMerchantCost: cost }));
  },
  setNewMerchantPrice: (id: number, price: string) => {
    set(() => ({ newMerchantPrice: { id, price } }));
  },
  resetNewMerchantPrice: () => {
    set(() => ({ newMerchantPrice: undefined }));
  },
  setTotalCost: (cost: string) => {
    set(() => ({ totalCost: cost }));
  },
  setNewTotalCost: (cost: string) => {
    set(() => ({ newTotalCost: cost }));
  },
  setPromoProduct: (promo: ICheckPriceProductsResponse | undefined) => {
    set(() => ({ promoProduct: promo }));
  },
  setPromoMerchant: (promo: ICheckMerchantPrice | undefined) => {
    set(() => ({ promoMerchant: promo }));
  },
  setPromoGlobal: (promo: ICheckPriceResponse | undefined) => {
    set(() => ({ promoGlobal: promo }));
  },
  setCourierCost: (amount: number, merchant_id: number, courierId: string) => {
    set((state) => ({
      groupedCart: state.groupedCart.map((cart) =>
        cart.merchant_id === merchant_id
          ? { ...cart, courier_cost: amount, courier_select: courierId }
          : cart,
      ),
    }));
  },
  setInitialMultiAmount: (initialMultiAmount: IItemsAmount[]) => {
    set(() => ({ multiCartAmount: initialMultiAmount }));
  },
  getInitialValue: async () => {
    const { data, error, message } = await service.getUserCart();

    if (error) {
      toast({ title: message.message, variant: "destructive" });
    }

    if (data !== null) {
      if (data.data.products.length > 0) {
        const sortedCart = data.data.products.sort(
          (a: IItemsAmount, b: IItemsAmount) => a.merchant_id - b.merchant_id,
        );
        const groupedCarts: IGroupedCart[] = groupCartByMerchantId(sortedCart);
        set(() => ({
          cartId: data.data.id,
          totalCost: data.data.total,
          multiCartAmount: sortedCart,
          groupedCart: groupedCarts,
        }));
      } else {
        set(() => ({
          cartId: data.data.id,
          totalCost: "",
          multiCartAmount: [],
          groupedCart: [],
        }));
      }
    } else {
      set(() => ({
        cartId: 0,
        totalCost: "",
        multiCartAmount: [],
        groupedCart: [],
      }));
    }
  },
  setDirectMultiAmount: async (
    cardId: number,
    amount: number,
    maxIncrease: number,
    multiCartAmount: IItemsAmount[],
  ) => {
    const { getInitialValue } = useCart.getState();
    if (maxIncrease) {
      set((state) => ({
        multiCartAmount: state.multiCartAmount.map((item) =>
          item.cart_product_id === cardId ? { ...item, amount: amount } : item,
        ),
      }));

      const isAmountChanged = multiCartAmount.some(
        (item) => item.cart_product_id === cardId && item.amount !== amount,
      );

      if (isAmountChanged) {
        const { error, data } = await service.updateProdCart({
          cart_product_id: cardId,
          quantity: amount,
        });
        getInitialValue();
        toast({ title: data.message, variant: "success" });
      }
    } else {
      if (isNaN(amount) || amount === 0) {
        const { error, data } = await service.updateProdCart({
          cart_product_id: cardId,
          quantity: 1,
        });
        set((state) => ({
          multiCartAmount: state.multiCartAmount.map((item) =>
            item.cart_product_id === cardId ? { ...item, amount: 1 } : item,
          ),
        }));
      } else {
        set((state) => ({
          multiCartAmount: state.multiCartAmount.map((item) =>
            item.cart_product_id === cardId
              ? { ...item, amount: amount }
              : item,
          ),
        }));
      }
    }
  },
}));
