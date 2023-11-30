import { useModal } from "@/store/modal/useModal";
import React from "react";
import styles from "./AddressList.module.scss";
import classNames from "classnames";
import LabeledContainer from "../Container/LabeledContainer";
import { Button } from "../ui/button";
import { EditDetailAddressForm } from "../Form/EditDetailAddressForm";
import { IUserAddresses } from "@/interfaces/user";
import { useUser } from "@/store/user/useUser";
import { TbHomeDown } from "react-icons/tb";
import { BsShop } from "react-icons/bs";
import { useLoading } from "@/store/loading/useLoading";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";

interface IAddressList {
  isActive?: boolean;
  addressData: IUserAddresses;
}

const AddressList = ({ isActive, addressData }: IAddressList) => {
  const { showModal } = useModal.getState();
  const userData = useUser.use.userData();
  const { setSelectedAddress, getUserAddresses } = useUser.getState();
  const { showLoading, hideLoading } = useLoading.getState();
  const { toast } = useToast();
  const handleShowEditAddress = () => {
    showModal(<EditDetailAddressForm />);
    setSelectedAddress(addressData);
  };

  const updateToUser = async (e: any) => {
    showLoading();
    e.stopPropagation();
    const { error } = await service.patchAddressToUserDefault(addressData.id);
    if (error) {
      toast({
        title: "Failed to set address to user default",
        variant: "destructive",
      });
      hideLoading();
    } else {
      toast({
        title: "Set address to user default successful",
        variant: "success",
      });
      getUserAddresses();
      hideLoading();
    }
  };
  const updateToMerchant = async (e: any) => {
    showLoading();
    e.stopPropagation();
    const { error } = await service.patchAddressToMerchantDefault(
      addressData.id,
    );
    if (error) {
      toast({
        title: "Failed to set address to merchant default",
        variant: "destructive",
      });
      hideLoading();
    } else {
      toast({
        title: "Set address to merchant default successful",
        variant: "success",
      });
      getUserAddresses();
      hideLoading();
    }
  };

  const addressListClasses = classNames(styles.listContainer, {
    [styles.isActive]: isActive,
  });
  return (
    <div onClick={handleShowEditAddress} className={`${addressListClasses}`}>
      <div className="relative h-full w-full rounded-lg p-3 pb-12 shadow-drop-line-sm">
        <div className="absolute bottom-3 right-3 flex gap-3">
          <Button
            className={addressData.is_default ? "hidden" : "block"}
            onClick={(e) => updateToUser(e)}
          >
            <div className="flex items-center gap-2">
              <TbHomeDown />
              Set Default
            </div>
          </Button>
          <Button
            className={
              addressData.is_shop_location || userData?.is_seller === false
                ? "hidden"
                : "block"
            }
            onClick={(e) => updateToMerchant(e)}
          >
            <div className="flex items-center gap-2">
              <BsShop />
              Set Merchant
            </div>
          </Button>
        </div>
        <div className="absolute bottom-4 left-3 flex h-7 w-fit gap-3 text-primary">
          {addressData.is_default && <TbHomeDown className="h-7 w-7" />}
          {addressData.is_shop_location && <BsShop className="h-7 w-7" />}
        </div>
        <p className="font-bold">{addressData.name}</p>
        <div className="text-sm">
          <p className="line-clamp-1">
            {addressData.district} - {addressData.zip_code}
          </p>
          <p className="line-clamp-1">
            {addressData.province} - {addressData.sub_district} -{" "}
            {addressData.sub_sub_district}
          </p>
        </div>
        <p className="text-sm">{addressData.phone_number}</p>
        <LabeledContainer content={addressData.details} lineClamp />
      </div>
    </div>
  );
};

export default AddressList;
