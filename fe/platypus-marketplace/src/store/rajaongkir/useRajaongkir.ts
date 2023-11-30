/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";
import { ICity, IProvice } from "@/interfaces/rajaongkir";
import { useLoading } from "../loading/useLoading";
import { handleNextApiRequest } from "../../utils/handleNextApiRequest";

type State = {
  provinces: IProvice[] | undefined;
  cities: ICity[] | undefined;
  provincesEdit: IProvice[] | undefined;
  citiesEdit: ICity[] | undefined;
};

type Actions = {
  getProvince: () => void;
  getCities: (provinceCode: string) => void;
  getProvinceEdit: () => void;
  getCitiesEdit: (provinceCode: string) => void;
  resetEdit: () => void;
};

const useRajaOngkirBase = create<State & Actions>((set) => ({
  provinces: undefined,
  cities: undefined,
  provincesEdit: undefined,
  citiesEdit: undefined,
  resetEdit: () => {
    set(() => ({ provincesEdit: undefined, citiesEdit: undefined }));
  },
  getCities: async (provinceCode: string) => {
    const { success, data, error } = await handleNextApiRequest<any>(
      `/vm4/api/rajaongkircities?province=${provinceCode}`,
      "GET",
    );

    if (success) {
      set(() => ({
        cities: data,
      }));
    } else {
      console.error(error);
    }
  },
  getProvince: async () => {
    const { success, data, error } = await handleNextApiRequest<any>(
      "/vm4/api/rajaongkirprov",
      "GET",
    );

    if (success) {
      set(() => ({
        provinces: data,
      }));
    } else {
      console.error(error);
    }
  },
  getCitiesEdit: async (provinceCode: string) => {
    const { showLoading, hideLoading } = useLoading.getState();

    try {
      showLoading();

      const response = await fetch(
        `/vm4/api/rajaongkircities?province=${provinceCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();

        set(() => ({
          citiesEdit: data,
        }));
        hideLoading();
      } else {
        const data = await response.json();
        hideLoading();
      }
    } catch (error) {
      hideLoading();
    }
  },
  getProvinceEdit: async () => {
    try {
      const response = await fetch("/vm4/api/rajaongkirprov", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();

        set(() => ({
          provincesEdit: data,
        }));
      } else {
        const data = await response.json();
      }
    } catch (error) {}
  },
}));

export const useRajaOngkir = createZusSelector(useRajaOngkirBase);
