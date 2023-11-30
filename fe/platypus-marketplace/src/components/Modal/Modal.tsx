import { useModal } from "@/store/modal/useModal";
import React from "react";
import { Button } from "../ui/button";

interface ModalProps {
  confirm?: boolean;
  decline?: boolean;
  backDropClose?: boolean;
  component?: React.ReactNode;
}

const Modal = ({ confirm, decline, component, backDropClose }: ModalProps) => {
  const show = useModal.use.show();
  const content = useModal.use.content();
  const { hideModal } = useModal.getState();

  if (!show) {
    return null;
  }

  const clickOutSide = (e: any) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={backDropClose ? hideModal : () => {}}
      className="fixed inset-0 top-0 z-[100] flex h-[100vh] w-[100vw] items-center justify-center bg-background/40 text-sm backdrop-blur-sm"
    >
      <div
        onClick={(e) => clickOutSide(e)}
        className={` animate-quantum_bouncing rounded-xl border-[1px] border-border bg-background shadow-sm`}
      >
        {component && component}
        {content}
        <div
          className={`${
            confirm || (decline && "mb-[2.5rem]")
          } flex justify-center gap-3`}
        >
          {confirm && (
            <div className="">
              <Button onClick={hideModal} name="agree-modal-1">
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

export default Modal;
