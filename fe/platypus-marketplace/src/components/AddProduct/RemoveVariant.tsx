import React from "react";
import { Button } from "../ui/button";
import { useModal } from "@/store/modal/useModal";

interface IRemoveVariant {
  onRemoveVariant: () => void;
}

const RemoveVariant = ({ onRemoveVariant }: IRemoveVariant) => {
  const { hideModal } = useModal.getState();
  return (
    <div className=" max-w-[25rem] space-y-5 px-7 py-3">
      <h3 className="text-center text-2xl font-bold text-primary">
        Remove Variant?
      </h3>
      <p className=" text-center text-muted-foreground">
        If you remove the variant, the variant data that has been entered will
        change and the variant type will disappear from the variant selection,
        proceed?
      </p>
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => hideModal()}
          type="button"
          className="flex-1"
          variant={"secondary"}
        >
          No
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onRemoveVariant();
            hideModal();
          }}
          type="button"
        >
          Yes
        </Button>
      </div>
    </div>
  );
};

export default RemoveVariant;
