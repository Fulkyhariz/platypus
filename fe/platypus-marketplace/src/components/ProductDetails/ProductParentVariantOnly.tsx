import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import VariantButton from "../Button/VariantButton/VariantButton";
import { useAmount } from "@/store/amount/useAmount";

const ProductParentVariantOnly = () => {
  const variants = useProdDetail.use.parentVariants();
  const totalDefImage = useProdDetail.use.totalDefImage();
  const choosenParent = useProdDetail.use.chosenParent();
  const activeImage = useProdDetail.use.activeImage();
  const { changeParent, setMainImage, setActiveImage, changeVarCombination } =
    useProdDetail.getState();
  const { setItemAmount } = useAmount.getState();

  if (!variants) {
    return <Skeleton className="h-5 w-full" />;
  }

  return (
    <>
      {variants.length > 1 && (
        <div className=" mt-5 space-y-2 border-t-[1px] border-border pt-3">
          <div>
            <p className="font-bold">
              Choose by {variants[0].parent_group}:{" "}
              {variants[choosenParent].parent_name}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {variants.map((variant, i) => {
              return (
                <VariantButton
                  onClick={() => {
                    changeVarCombination(
                      variant.variant_combination_product_id as number,
                    );
                    changeParent(i);
                    setItemAmount(1);
                    setMainImage(
                      variant.parent_picture
                        ? (variant.parent_picture as string)
                        : "",
                    );
                    setActiveImage(
                      variant.parent_picture ? totalDefImage + i : activeImage,
                    );
                  }}
                  key={variant.parent_name}
                  isActive={i === choosenParent}
                >
                  {variant.parent_picture && (
                    <Image
                      className="rounded-lg"
                      alt={variant.parent_group}
                      height={30}
                      width={30}
                      src={variant.parent_picture}
                      loading="lazy"
                    />
                  )}
                  {variant.parent_name}
                </VariantButton>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductParentVariantOnly;
