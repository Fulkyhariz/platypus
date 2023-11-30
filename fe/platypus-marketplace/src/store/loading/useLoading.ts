import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";

type State = {
  show: boolean;
  looadingSm: boolean;
};

type Actions = {
  showLoading: () => void;
  hideLoading: () => void;
  showLoadingSm: () => void;
  hideLoadingSm: () => void;
};

const useLoadingBase = create<State & Actions>((set) => ({
  show: false,
  looadingSm: false,
  showLoading: () => set(() => ({ show: true })),
  hideLoading: () => set(() => ({ show: false })),
  showLoadingSm: () => set(() => ({ looadingSm: true })),
  hideLoadingSm: () => set(() => ({ looadingSm: false })),
}));

export const useLoading = createZusSelector(useLoadingBase);
