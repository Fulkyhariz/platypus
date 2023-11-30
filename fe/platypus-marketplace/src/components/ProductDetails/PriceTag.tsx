import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { formatIDR } from "@/utils/formatIDR";
import ProductParentVariantOnly from "./ProductParentVariantOnly";
import ProductParentHasChild from "./ProductParentHasChild";

const PriceTag = () => {
  const variants = useProdDetail.use.parentVariants();
  const childVariants = useProdDetail.use.childVariants();
  const variantType = useProdDetail.use.variantType();
  const choosenParent = useProdDetail.use.chosenParent();
  const choosenChild = useProdDetail.use.chosenChild();
  if (!variants) {
    return <Skeleton className="h-5 w-full" />;
  }

  return (
    <div className="my-5">
      {variantType === "parent" ? (
        <p className="text-3xl font-bold text-primary">
          {formatIDR(variants[choosenParent].price)}
        </p>
      ) : (
        <p className="text-3xl font-bold text-primary">
          {childVariants &&
            formatIDR(
              childVariants[choosenParent].variant_child[choosenChild].price,
            )}
        </p>
      )}

      {variantType === "parent" && <ProductParentVariantOnly />}
      {variantType == "child" && <ProductParentHasChild />}
    </div>
  );
};

export default PriceTag;
