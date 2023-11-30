import React from "react";
import { Button } from "../ui/button";
import { useModal } from "@/store/modal/useModal";
import { ManageCheckOut } from "./ManageCheckOut";

export const ManageMobileCheckOut = () => {
  const { showModalUpSlide, hideModalUpSlide } = useModal.getState();
  const showUpSlide = useModal.use.showUpSlide();
  const onShowCheckoutManager = () => {
    if (showUpSlide) {
      hideModalUpSlide();
    } else {
      showModalUpSlide(
        <div className=" pb-14">
          <ManageCheckOut />
        </div>,
      );
    }
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] flex h-14 w-full items-center justify-center gap-3 overflow-y-scroll border-t-[1px] bg-background px-3 shadow-drop-line lg:hidden">
      <Button
        variant={showUpSlide ? "secondary" : "default"}
        onClick={onShowCheckoutManager}
        className="w-full"
        type="button"
      >
        {showUpSlide ? "Close Summary" : "Show Summary"}
      </Button>
    </div>
  );
};
