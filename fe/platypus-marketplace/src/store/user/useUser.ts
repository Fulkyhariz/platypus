/*eslint no-unused-vars: "off"*/

import { IUserAddresses, IUserData } from "@/interfaces/user";
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";
import service from "@/services/services";
import { getCookie } from "cookies-next";
import { IWallet } from "@/interfaces/wallet";
import { IUserTransaction } from "@/interfaces/transactionHistory";
import { axiosTokenized } from "@/utils/axiosTokenized";
import { IPaginationData } from "@/interfaces/pagination";

// const { toast } = useToast();

const accessToken = getCookie("accessToken");
const refreshToken = getCookie("refreshToken");

type State = {
  isLoggedIn: boolean;
  tokenExpired: boolean;
  userData: IUserData | undefined;
  userAddresses: IUserAddresses[] | undefined;
  selectedAddress: IUserAddresses | undefined;
  defaultAddress: IUserAddresses[] | undefined;
  userDefaultAddress: IUserAddresses | undefined;
  walletData: IWallet | undefined;
  userTransactions: IUserTransaction[] | undefined;
  userDetailTransaction: IUserTransaction | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  setUserData: (userData: any) => void;
  getUserData: () => void;
  getWalletData: () => void;
  getUserAddresses: (token?: string) => void;
  addNewAddress: (newAddress: IUserAddresses) => void;
  setSelectedAddress: (address: IUserAddresses) => void;
  resetUseUser: () => void;
  getUserTransaction: (page: number) => void;
  getUserDetailTransaction: (id: number) => void;
};

const useUserBase = create<State & Actions>((set) => ({
  isLoggedIn: false,
  tokenExpired: false,
  userData: undefined,
  userAddresses: undefined,
  selectedAddress: undefined,
  defaultAddress: undefined,
  userDefaultAddress: undefined,
  walletData: undefined,
  userTransactions: undefined,
  userDetailTransaction: undefined,
  pageInformation: undefined,
  addNewAddress: (newAddress: IUserAddresses) => {
    set((state) => ({
      userAddresses: state.userAddresses
        ? [...state.userAddresses, newAddress]
        : [newAddress],
    }));
  },
  setUserData: (userData: IUserData) => {
    set(() => ({ userData }));
  },
  getWalletData: async () => {
    if (accessToken && refreshToken) {
      const { error, data, message } = await service.getWalletData();

      if (error) {
      } else {
        set(() => ({ walletData: data.data }));
      }
    }
  },
  getUserData: async () => {
    if (accessToken && refreshToken) {
      const { error, data, message } = await service.getUserData();

      if (error) {
        console.error(message);
      } else {
        set(() => ({ userData: data.data }));
      }
    }
  },
  getUserAddresses: async () => {
    const { error, data, message } = await service.getUserAddresses();

    if (error) {
      console.error(message);
    } else {
      if (data.data) {
        const defaultAddress = data.data.filter(function (
          address: IUserAddresses,
        ) {
          return address.is_default || address.is_shop_location;
        });
        const userDefaultAddress = data.data.filter(function (
          address: IUserAddresses,
        ) {
          return address.is_default;
        });

        set(() => ({
          userAddresses: data.data,
          defaultAddress: defaultAddress,
          userDefaultAddress: userDefaultAddress[0],
        }));
      } else {
        if (data.data === null) {
          set(() => ({
            userAddresses: [],
          }));
        } else {
          set(() => ({
            userAddresses: data.data,
          }));
        }
      }
    }
  },
  setSelectedAddress: (address: IUserAddresses) => {
    set(() => ({ selectedAddress: { ...address } }));
  },
  resetUseUser: () => {
    set(() => ({
      tokenExpired: false,
      userData: undefined,
      userAddresses: undefined,
      selectedAddress: undefined,
    }));
  },
  getUserTransaction: async (page: number) => {
    const { data } = await axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/orders?page=${page}`,
      {},
    );
    console.log(data);

    set(() => ({
      userTransactions: data.data,
      pageInformation: data.meta.pagination_info,
    }));
  },
  getUserDetailTransaction: async (id: number) => {
    const { data } = await axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/orders/${id}`,
      {},
    );

    set(() => ({ userDetailTransaction: data.data }));
  },
}));

export const useUser = createZusSelector(useUserBase);
