import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import React, { useEffect, useRef } from "react";
import ProductTitle from "./ProductTitle";
import PriceTag from "./PriceTag";
import { TbBiohazard, TbBiohazardOff } from "react-icons/tb";
import { BsCheckCircleFill, BsSlashCircleFill } from "react-icons/bs";

const ProductDetailDescriptions = () => {
  const productData = useProdDetail.use.productDetail();
  const variants = useProdDetail.use.parentVariants();
  const descContentRef = useRef<HTMLDivElement>(null);
  const formattedString = productData?.description.replace(/\n/g, "<br>");

  useEffect(() => {
    if (descContentRef.current && formattedString) {
      descContentRef.current.innerHTML = formattedString;
    }
  }, [formattedString]);

  if (!productData || !variants) {
    return null;
  }
  return (
    <div>
      <ProductTitle />
      <PriceTag />
      <div className="flex justify-between">
        <div>
          <p className="line-clamp-1">Length {productData.length}cm</p>
          <p className="line-clamp-1">Width {productData.width}cm</p>
        </div>
        <div>
          <p className="line-clamp-1">Height {productData.height}cm</p>
          <p className="line-clamp-1">Weight {productData.weight}gram</p>
        </div>
        <div>
          <div className="line-clamp-1 flex items-center gap-1">
            <p>{`Is Hazardous `}</p>
            {productData.is_hazardous ? (
              <TbBiohazard className=" text-destructive" />
            ) : (
              <TbBiohazardOff />
            )}
          </div>
          <div className="line-clamp-1 flex items-center gap-1">
            <p>{`Is Used `}</p>
            {productData.is_used ? (
              <BsCheckCircleFill className="text-green-500" />
            ) : (
              <BsSlashCircleFill />
            )}
          </div>
        </div>
      </div>
      <div
        className="mt-5 border-t-[1px] border-border pt-5"
        ref={descContentRef}
      >
        d
      </div>
    </div>
  );
};

export default ProductDetailDescriptions;
