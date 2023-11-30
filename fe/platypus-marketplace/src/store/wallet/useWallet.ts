import { create } from "zustand";
import { useLoading } from "../loading/useLoading";
import service from "@/services/services";
import { IPaginationData } from "@/interfaces/pagination";
import { IWalletHistory } from "@/interfaces/wallet";

type State = {
  myWalletHistory: IWalletHistory[] | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  getWalletHistory: (page: number) => void;
};

export const useWallet = create<State & Actions>((set) => ({
  myWalletHistory: undefined,
  pageInformation: undefined,
  getWalletHistory: async (page: number) => {
    const { showLoading, hideLoading } = useLoading.getState();
    showLoading();
    const { data } = await service.getWalletHistory(page);

    hideLoading();
    set(() => ({
      myWalletHistory: data.data,
      pageInformation: data.meta.pagination_info,
    }));
  },
}));
