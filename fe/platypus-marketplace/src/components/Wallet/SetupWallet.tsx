import React from "react";
import PlatypusHead from "../SVG/PlatypusHead";
import { IoWallet } from "react-icons/io5";
import WalletPinSetUpForm from "../Form/WalletPinSetUpForm";

const SetupWallet = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="flex animate-quantum_bouncing gap-3">
        <PlatypusHead className=" h-16 w-16 lg:h-32 lg:w-32" />
        <div className="flex flex-col justify-between">
          <IoWallet className="h-8 w-8 text-primary lg:h-20 lg:w-20" />
          <h2 className=" text-3xl font-bold text-primary lg:text-4xl">
            PlatyPay
          </h2>
        </div>
      </div>
      <WalletPinSetUpForm />
    </div>
  );
};

export default SetupWallet;
