/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";

type State = {
  page: number;
};

type Actions = {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
};

const usePaginationBase = create<State & Actions>((set) => ({
  page: 1,
  nextPage: () => {
    set((state) => ({ page: state.page + 1 }));
  },
  prevPage: () => {
    set((state) => ({ page: state.page - 1 }));
  },
  goToPage: (page: number) => {
    set(() => ({ page }));
  },
}));

export const usePagination = createZusSelector(usePaginationBase);
