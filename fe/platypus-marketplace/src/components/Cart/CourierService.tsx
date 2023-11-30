import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { handleNextApiRequest } from "@/utils/handleNextApiRequest";
import { IGroupedCart } from "@/interfaces/zustandStore";
import { ICostRajaOngkirPayload } from "@/interfaces/rajaongkir";
import { useUser } from "@/store/user/useUser";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import { useToast } from "../ui/use-toast";
import { formatIDR } from "@/utils/formatIDR";
import { useCart } from "@/store/cart/useCart";

interface ICourierService {
  groupedCart: IGroupedCart;
}

const CourierService = ({ groupedCart }: ICourierService) => {
  const [service, setService] =
    useState<{ cost: number; service: string; image: string }[]>();
  const userDefaultAddress = useUser.use.userDefaultAddress();
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();
  const { setCourierCost } = useCart();
  const { toast } = useToast();

  const onCourierSelected = (courInfo: string) => {
    const coursplitted = courInfo.split("&");
    setCourierCost(
      parseInt(coursplitted[1]),
      groupedCart.merchant_id,
      coursplitted[0],
    );
  };

  if (!userDefaultAddress) {
    return null;
  }

  const payloadRajaOngkirCost: ICostRajaOngkirPayload[] = [
    {
      origin: groupedCart.city_id,
      destination: userDefaultAddress.district_code,
      weight: groupedCart.total_weight,
      courier: "jne",
      image:
        "https://res.cloudinary.com/dro3sbdac/image/upload/v1700725973/h4hvburldrz5gbhpy0cg.png",
    },
    {
      origin: groupedCart.city_id,
      destination: userDefaultAddress.district_code,
      weight: groupedCart.total_weight,
      courier: "pos",
      image:
        "https://res.cloudinary.com/dro3sbdac/image/upload/v1700726568/wvkxuc3vmunko6bmj1av.png",
    },
    {
      origin: groupedCart.city_id,
      destination: userDefaultAddress.district_code,
      weight: groupedCart.total_weight,
      courier: "tiki",
      image:
        "https://res.cloudinary.com/dro3sbdac/image/upload/v1700725953/cuwknhoddihpy8eiebmn.png",
    },
  ];

  const onClickSelectService = async () => {
    showLoadingSm();
    const { success, data, error, code } = await handleNextApiRequest<any>(
      `/vm4/api/rajaongkircost`,
      "POST",
      "",
      payloadRajaOngkirCost,
    );

    if (success) {
      setService(data.costs);
      hideLoadingSm();
    } else if (error && code === 404) {
      toast({
        title: error,
        variant: "destructive",
        description:
          "You need to remove all of item in your cart from the selected merchant",
      });
      hideLoadingSm();
    }
  };

  return (
    <>
      {service ? (
        <>
          <Select onValueChange={(v) => onCourierSelected(v)}>
            <SelectTrigger className="w-80 max-lg:w-full">
              <SelectValue placeholder="Select Courier" />
            </SelectTrigger>
            <SelectContent>
              {service
                ? service.map((serv) => (
                    <SelectItem
                      key={serv.service}
                      value={`${serv.service}&${serv.cost}`}
                      className=" cursor-pointer"
                    >
                      <div className="flex gap-5">
                        <p>{serv.service.toUpperCase()}</p>
                        <ImageWithFallback
                          alt={`${serv}-image`}
                          className="h-5 w-auto"
                          src={serv.image}
                          width={100}
                          height={200}
                        />
                        <p>{formatIDR(serv.cost)}</p>
                      </div>
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        </>
      ) : (
        <ButtonWithLoading
          className="w-full"
          buttonContent="Check Available Courier"
          onClick={onClickSelectService}
        />
      )}
    </>
  );
};

export default CourierService;
