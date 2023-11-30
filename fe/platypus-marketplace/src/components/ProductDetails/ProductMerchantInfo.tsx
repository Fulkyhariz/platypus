import React from "react";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import { Skeleton } from "../ui/skeleton";
import { formatDateLong } from "@/utils/formatDateLong";
import { AiOutlineStar } from "react-icons/ai";
import Link from "next/link";

const ProductMerchantInfo = () => {
  const merchantInfo = useProdDetail.use.merchantInfo();
  const productDetail = useProdDetail.use.productDetail();

  if (!merchantInfo || !productDetail) {
    return (
      <div className="mt-3 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    );
  }
  https: return (
    <div className="mt-3 flex items-center justify-between border-y-[1px] border-border py-3">
      <Link href={`/merchant/${productDetail.username}`} className="flex gap-3">
        <ImageWithFallback
          className="rounded-full"
          alt={"product_image"}
          src={`https://ui-avatars.com/api/?background=7b3aed&name=${merchantInfo.name}&size=254&color=ffffff`}
          height={50}
          width={50}
          loading="lazy"
          fallbackSrc={process.env.IMAGE_FALLBACK as string}
          placeholder="empty"
        />
        <div>
          <Link
            href={`/merchant/${productDetail.username}`}
            className="font-bold text-primary"
          >
            {merchantInfo.name}
          </Link>
          <p>{formatDateLong(merchantInfo.opening_date)}</p>
        </div>
      </Link>
      <div className="flex items-center">
        <AiOutlineStar />
        <p>{merchantInfo.rating}</p>
      </div>
    </div>
  );
};

export default ProductMerchantInfo;
