/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";

type State = {
  show: boolean;
  content: React.ReactNode | null;
  showUpSlide: boolean;
  contentUpslide: React.ReactNode | null;
};

type Actions = {
  showModal: (content: React.ReactNode) => void;
  hideModal: () => void;
  showModalUpSlide: (contentUpslide: React.ReactNode) => void;
  hideModalUpSlide: () => void;
};

const useModalBase = create<State & Actions>((set) => ({
  show: false,
  content: null,
  showUpSlide: false,
  contentUpslide: null,
  showModal: (content) => set(() => ({ show: true, content })),
  hideModal: () => set(() => ({ show: false })),
  showModalUpSlide: (contentUpslide) =>
    set(() => ({ showUpSlide: true, contentUpslide })),
  hideModalUpSlide: () => set(() => ({ showUpSlide: false })),
}));

export const useModal = createZusSelector(useModalBase);
