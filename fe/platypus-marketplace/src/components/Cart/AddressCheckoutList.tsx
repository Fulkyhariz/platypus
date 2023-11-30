import { useUser } from "@/store/user/useUser";
import React from "react";
import AddressList from "../UserAddress/AddressList";

const AddressCheckoutList = () => {
  const defaultAddress = useUser.use.defaultAddress();
  const userAddresses = useUser.use.userAddresses();

  if (!userAddresses) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-3 p-5">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </main>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-scroll p-3 md:rounded-lg md:border-[1px] md:border-border md:p-5">
      <h1 className="pb-5 text-center text-lg font-bold text-primary md:text-xl">
        List Of Your Address
      </h1>
      <div className="grid gap-3 md:grid-cols-2">
        {defaultAddress &&
          defaultAddress.map((address) => {
            return (
              <AddressList
                isActive={address.is_default || address.is_shop_location}
                key={address.id}
                addressData={address}
              />
            );
          })}
        {userAddresses.map((address) => {
          if (!address.is_default && !address.is_shop_location)
            return (
              <AddressList
                isActive={address.is_default}
                key={address.id}
                addressData={address}
              />
            );
        })}
      </div>
    </div>
  );
};

export default AddressCheckoutList;
