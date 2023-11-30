import { create } from "zustand";
import { IProductMyList } from "@/interfaces/product";
import { useLoading } from "../loading/useLoading";
import service from "@/services/services";
import { IPaginationData } from "@/interfaces/pagination";
import { toast } from "@/components/ui/use-toast";

type State = {
  myProdList: IProductMyList[] | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  getProductList: (
    page: number,
    exclude_no_stock: boolean,
    sort_by: string,
    sort: "asc" | "desc",
    username: string,
    search: string,
    exclude_not_active: boolean,
  ) => void;
};

export const useMyList = create<State & Actions>((set) => ({
  myProdList: undefined,
  pageInformation: undefined,
  getProductList: async (
    page: number,
    exclude_no_stock: boolean,
    sort_by: string,
    sort: "asc" | "desc",
    username: string,
    search: string,
    exclude_not_active: boolean,
  ) => {
    const { showLoading, hideLoading } = useLoading.getState();
    showLoading();
    const { error, data } = await service.getAllMyProdcutList(
      page,
      exclude_no_stock,
      sort_by,
      sort,
      username,
      search,
      exclude_not_active,
    );

    if (error) {
      hideLoading();
      toast({ title: data.message, variant: "destructive" });
    } else {
      hideLoading();
      set(() => ({
        myProdList: data.data,
        pageInformation: data.meta.pagination_info,
      }));
    }
  },
}));
