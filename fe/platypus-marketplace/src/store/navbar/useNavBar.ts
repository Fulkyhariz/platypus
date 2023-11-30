/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";

type State = {
  navHeight: number;
  detailNavHeight: number;
};

type Actions = {
  setNavHeight: (height: number) => void;
  setDetailNavHeight: (height: number) => void;
};

const useNavBarBase = create<State & Actions>((set) => ({
  navHeight: 0,
  detailNavHeight: 0,
  setNavHeight: (height: number) => set(() => ({ navHeight: height })),
  setDetailNavHeight: (height: number) =>
    set(() => ({ detailNavHeight: height })),
}));

export const useNavBar = createZusSelector(useNavBarBase);
