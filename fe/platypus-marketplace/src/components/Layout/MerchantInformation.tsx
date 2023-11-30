import React from "react";
import { AiTwotoneStar } from "react-icons/ai";
import { Badge } from "@/components/ui/badge";
import { useMerchant } from "@/store/merchant/useMerchant";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

const MerchantInformation = () => {
  const merchantData = useMerchant.use.merchant();

  if (!merchantData) {
    return <Skeleton className=" h-44 w-full" />;
  }
  const dummyImageUrl = merchantData.name.replace(/ /g, "+");

  return (
    <div className="relative mt-3 flex w-full justify-center py-5 md:mt-0">
      <Image
        src={`https://dummyimage.com/1280x360/7b3aed/ffffff.jpg&text=${dummyImageUrl}`}
        loading="lazy"
        alt={merchantData?.name as string}
        height={1800}
        width={1800}
        className="absolute left-0 top-0 h-full w-full rounded-bl-lg rounded-br-lg object-cover"
      />
      <div className="z-10 flex flex-col items-center">
        <Image
          src={`https://ui-avatars.com/api/?background=7b3aed&name=${merchantData.name}&size=254&color=ffffff`}
          loading="lazy"
          alt={merchantData?.name as string}
          height={500}
          width={500}
          className="absolute z-10 h-24 w-24 rounded-full border-4 border-white bg-white md:h-28 md:w-28"
        />
        <div className="relative h-24 w-24 rounded-full bg-transparent md:h-28 md:w-28">
          <div className="absolute bottom-0 z-10 flex h-5 w-24 items-center justify-center  rounded-tl rounded-tr bg-slate-800 md:w-28">
            <p className="text-[9px] font-medium text-white md:text-[10px] md:font-semibold">
              Platypus Merchant
            </p>
          </div>
        </div>
        <div className="min-w-[200px] rounded-lg bg-white/70 p-2 md:min-w-[300px] md:gap-5 lg:min-w-[350px]">
          <h2 className="mb-3 border-b border-b-black/30 text-center text-lg font-semibold">
            {merchantData?.name}
          </h2>
          <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between">
            <p className="text-xs">
              Since: {merchantData?.opening_date.slice(0, 10)}
            </p>
            <p className="text-xs">
              Location: {merchantData?.address.district}
            </p>
            <Badge className="mt-3 flex h-5 w-fit gap-2 text-xs md:right-0 md:top-0 md:mt-0">
              <AiTwotoneStar />
              <p>{merchantData?.rating}</p>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantInformation;
