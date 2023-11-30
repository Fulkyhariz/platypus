/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";

type State = {
  category: string | undefined;
  location: string | undefined;
  min_price: string | undefined;
  max_price: string | undefined;
  min_rating: string | undefined;
  sort_by: string | undefined;
  sort: string | undefined;
  q: string | undefined;
};

type Actions = {
  setCategory: (category: string) => void;
  setLocation: (location: string) => void;
  setMinPrice: (min_price: string) => void;
  setMaxPrice: (max_price: string) => void;
  setMinRating: (min_rating: string) => void;
  setSortBy: (sort_by: string) => void;
  setSort: (sort: string) => void;
  setQ: (q: string) => void;
};

const useFilterBase = create<State & Actions>((set) => ({
  category: undefined,
  location: undefined,
  min_price: undefined,
  max_price: undefined,
  min_rating: undefined,
  sort_by: undefined,
  sort: undefined,
  q: undefined,
  setCategory: (category: string) => set(() => ({ category: category })),
  setLocation: (location: string) => set(() => ({ location: location })),
  setMinPrice: (min_price: string) => set(() => ({ min_price: min_price })),
  setMaxPrice: (max_price: string) => set(() => ({ max_price: max_price })),
  setMinRating: (min_rating: string) => set(() => ({ min_rating: min_rating })),
  setSortBy: (sort_by: string) => set(() => ({ sort_by: sort_by })),
  setSort: (sort: string) => set(() => ({ sort: sort })),
  setQ: (q: string) => set(() => ({ q: q })),
}));

export const useFilter = createZusSelector(useFilterBase);
