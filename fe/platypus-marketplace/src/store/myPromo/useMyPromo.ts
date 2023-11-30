import { create } from "zustand";
import { useLoading } from "../loading/useLoading";
import service from "@/services/services";
import { IPaginationData } from "@/interfaces/pagination";
import { ISellerPromoDetail } from "@/interfaces/promo";

type State = {
  myPromoList: ISellerPromoDetail[] | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  getPromoList: (page: number, status: string, username: string) => void;
};

export const useMyPromo = create<State & Actions>((set) => ({
  myPromoList: undefined,
  pageInformation: undefined,
  getPromoList: async (page: number, status: string, username: string) => {
    const { showLoading, hideLoading } = useLoading.getState();
    showLoading();
    const { data } = await service.getAllMyPromoList(page, status, username);

    hideLoading();
    set(() => ({
      myPromoList: data.data,
      pageInformation: data.meta.pagination_info,
    }));
  },
}));
