/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";

type State = {
  itemAmount: number;
};

type Actions = {
  plusItemAmount: () => void;
  minusItemAmount: () => void;
  setItemAmount: (amount: number, maxIncrease?: number) => void;
};

const useAmountBase = create<State & Actions>((set) => ({
  itemAmount: 1,
  plusItemAmount: () => set((state) => ({ itemAmount: state.itemAmount + 1 })),
  minusItemAmount: () => set((state) => ({ itemAmount: state.itemAmount - 1 })),
  setItemAmount: (amount: number, maxIncrease?: number) => {
    if (maxIncrease) {
      if (amount === 0) {
        set(() => ({ itemAmount: 1 }));
      } else if (amount > maxIncrease) {
        set(() => ({ itemAmount: maxIncrease }));
      } else {
        set(() => ({ itemAmount: amount }));
      }
    } else {
      if (isNaN(amount) || amount === 0) {
        set(() => ({ itemAmount: 1 }));
      } else {
        set(() => ({ itemAmount: amount }));
      }
    }
  },
}));

export const useAmount = createZusSelector(useAmountBase);
