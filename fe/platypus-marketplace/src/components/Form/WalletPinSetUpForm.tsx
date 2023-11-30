"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import PinInput from "react-pin-input";
import { useLoading } from "@/store/loading/useLoading";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";
import { useUser } from "@/store/user/useUser";

const WalletPinSetUpForm = () => {
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { getWalletData } = useUser.getState();
  const { toast } = useToast();
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();
  const onChangePin = (value: string) => {
    setPin(value);
  };

  const toggleShowPin = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmitPin = async () => {
    showLoadingSm();
    const { error } = await service.postWalletData({
      pin,
    });

    if (error) {
      hideLoadingSm();
      toast({
        title: "Failed to setup wallet",
        variant: "destructive",
      });
    } else {
      hideLoadingSm();
      toast({ title: "Setup wallet success", variant: "success" });
      getWalletData();
    }
  };

  return (
    <div id="edit-first-name" className="md:w-[50vh]">
      <div className="flex flex-col items-center justify-center">
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
        <div className={`${showPassword ? "opacity-100" : " opacity-0"} `}>
          <Input
            className="border-none text-center"
            value={pin}
            type={showPassword ? "text" : "password"}
            disabled
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShowPin}
            className="rounded-full bg-primary text-primary-foreground"
          >
            {showPassword ? (
              <FaRegEye className="m-2 h-5 w-5" />
            ) : (
              <FaRegEyeSlash className="m-2 h-5 w-5" />
            )}
          </button>
          <ButtonWithLoading
            onClick={handleSubmitPin}
            disabled={pin.length < 6}
            buttonContent="Confirm"
            loadingContent="Setting up your pin..."
          />
        </div>
      </div>
    </div>
  );
};

export default WalletPinSetUpForm;
