import { create } from "zustand";
import { useLoading } from "../loading/useLoading";
import service from "@/services/services";
import { IPaginationData } from "@/interfaces/pagination";
import { ISellerOrderList } from "@/interfaces/order";

type State = {
  myOrderList: ISellerOrderList[] | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  getOrderList: (page: number) => void;
};

export const useMyOrder = create<State & Actions>((set) => ({
  myOrderList: undefined,
  pageInformation: undefined,
  getOrderList: async (page: number) => {
    const { showLoading, hideLoading } = useLoading.getState();
    showLoading();
    const { data } = await service.getAllMyOrderList(page);

    hideLoading();
    set(() => ({
      myOrderList: data.data,
      pageInformation: data.meta.pagination_info,
    }));
  },
}));
