import { useModal } from "@/store/modal/useModal";
import React from "react";
import { Button } from "../ui/button";

interface ModalProps {
  confirm?: boolean;
  decline?: boolean;
  backDropClose?: boolean;
  component?: React.ReactNode;
}

const ModalUpSlide = ({
  confirm,
  decline,
  component,
  backDropClose,
}: ModalProps) => {
  const showUpSlide = useModal.use.showUpSlide();
  const contentUpslide = useModal.use.contentUpslide();
  const { hideModalUpSlide } = useModal.getState();

  if (!showUpSlide) {
    return null;
  }

  const clickOutSide = (e: any) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={backDropClose ? hideModalUpSlide : () => {}}
      className="fixed inset-0 top-0 z-[100] flex h-[100vh] w-[100vw] bg-background/40 text-sm backdrop-blur-sm"
    >
      <div
        onClick={(e) => clickOutSide(e)}
        className={` h-[50%] w-full animate-slide_bottom_to_top self-end overflow-y-scroll rounded-t-xl border-[1px] border-b-0 border-border bg-background shadow-sm transition duration-300`}
      >
        {component && component}
        {contentUpslide}
        <div
          className={`${
            confirm || (decline && "mb-[2.5rem]")
          } flex justify-center gap-3`}
        >
          {confirm && (
            <div className="">
              <Button onClick={hideModalUpSlide} name="agree-modal-1">
                Agree
              </Button>
            </div>
          )}
          {decline && (
            <div className="">
              <Button name="close-modal-1">Close</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalUpSlide;
