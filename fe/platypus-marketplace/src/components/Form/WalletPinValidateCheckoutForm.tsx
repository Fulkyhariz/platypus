"use client";

import React, { useState } from "react";
import PinInput from "react-pin-input";
import { useToast } from "../ui/use-toast";
import { ICheckOutPayload } from "@/interfaces/checkout";
import service from "@/services/services";
import { useModal } from "@/store/modal/useModal";
import { useRouter } from "next/router";

interface IWalletPinValidateCheckoutForm {
  checkOutPayload: ICheckOutPayload;
}

const WalletPinValidateCheckoutForm = ({
  checkOutPayload,
}: IWalletPinValidateCheckoutForm) => {
  const [pin, setPin] = useState("");
  const { toast } = useToast();
  const { hideModal } = useModal.getState();
  const router = useRouter();
  const onChangePin = async (value: string) => {
    setPin(value);
    if (value.length === 6) {
      toast({ title: "Validating...", variant: "success" });
      const { error, data, message } = await service.postWalletAuth({
        pin: value,
      });

      const recievedData = data;

      if (error) {
        toast({ title: message.message, variant: "destructive" });
        hideModal();
      } else {
        const checkoutToken = recievedData.data;

        const { error, message, code } = await service.postCheckOut(
          checkOutPayload,
          checkoutToken,
        );
        if (error && code === 400) {
          toast({ title: message, variant: "destructive" });
          hideModal();
        } else if (error) {
          toast({ title: message.message, variant: "destructive" });
          hideModal();
        } else {
          toast({ title: "Checkout Success", variant: "success" });
          router.push("/user/transactions");
          hideModal();
        }
      }
    }
  };

  return (
    <div id="edit-first-name" className="m-10 space-y-5">
      {pin.length === 6 ? (
        <div className="text-center">
          <span className="loading loading-dots loading-lg text-center text-primary"></span>
        </div>
      ) : (
        <>
          <h2 className="text-center text-lg font-bold text-primary lg:text-2xl">
            Enter your Platypay PIN
          </h2>
          <PinInput
            length={6}
            focus
            secret
            secretDelay={700}
            type="numeric"
            inputStyle={{ borderRadius: "8px" }}
            inputFocusStyle={{ borderColor: "rgb(124, 58, 237)" }}
            onChange={(e) => onChangePin(e)}
          />
        </>
      )}
    </div>
  );
};

export default WalletPinValidateCheckoutForm;
