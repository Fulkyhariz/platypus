/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";
import { IMerchant } from "@/pages/merchant/[name]";
import { IProduct } from "@/pages/merchant/[name]/products";
import { IPaginationData } from "@/interfaces/pagination";

interface IPromotion {
  id: number;
  name: string;
  promotion_type: "CUT" | "DISC";
  promotion_scope: string;
  voucher_code: string;
  amount: number;
  quota: number;
  max_amount: string | null;
  products: null;
  start_date: Date;
  end_date: Date;
  promotion_status: string; //"ongoing"
}
type State = {
  merchant: IMerchant | undefined;
  products: IProduct[] | undefined;
  cat: string | undefined;
  promotions: IPromotion[] | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  setPaginationInfo: (paginationInfo: IPaginationData) => void;
  setMerchant: (merchant: IMerchant) => void;
  setProducts: (products: IProduct[]) => void;
  setCat: (cat: string) => void;
  getSortedBy: (
    name: string,
    type: string,
    order: string,
    id: string,
    page: number,
  ) => void;
  getPromotion: (uname_merchant: string, page: number) => void;
};

const useMerchantBase = create<State & Actions>((set) => ({
  merchant: undefined,
  products: undefined,
  cat: undefined,
  pageInformation: undefined,
  setPaginationInfo: (paginationInfo: IPaginationData) => {
    set(() => ({ pageInformation: paginationInfo }));
  },
  promotions: undefined,
  setMerchant: (merchant: IMerchant) => set(() => ({ merchant: merchant })),
  setProducts: (products: IProduct[]) => set(() => ({ products: products })),
  setCat: (cat: string) => set(() => ({ cat: cat })),
  getSortedBy: async (
    name: string = "",
    type: string = "",
    order: string = "",
    id: string = "",
    page: number = 1,
  ) => {
    const responseProducts = await fetch(
      `${process.env.BASE_API_URL}/merchants/${name}/products?sort_by=${type}&sort=${order}&category=${id}&page=${page}&limit=18`,
    );
    const resultJSONProducts = await responseProducts.json();
    const products = resultJSONProducts.data;
    set(() => ({
      products: products,
      pageInformation: resultJSONProducts.meta.pagination_info,
    }));
  },
  getPromotion: async (uname_merchant: string, page: number = 1) => {
    const responsePromotions = await fetch(
      `${process.env.BASE_API_URL}/merchants/${uname_merchant}/promotions?page=${page}&limit=5`,
    );
    const resultJSONPromotions = await responsePromotions.json();
    const promotions = resultJSONPromotions.data;

    console.log(resultJSONPromotions, "ini promosion");

    // if() {

    // }

    set(() => ({
      promotions: promotions,
      pageInformation: resultJSONPromotions.meta.pagination_info,
    }));
  },
}));

export const useMerchant = createZusSelector(useMerchantBase);
