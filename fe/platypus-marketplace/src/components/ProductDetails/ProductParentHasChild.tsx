import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import VariantButton from "../Button/VariantButton/VariantButton";
import { useAmount } from "@/store/amount/useAmount";

const ProductParentHasChild = () => {
  const variants = useProdDetail.use.parentVariants();
  const childVariants = useProdDetail.use.childVariants();
  const totalDefImage = useProdDetail.use.totalDefImage();
  const choosenParent = useProdDetail.use.chosenParent();
  const activeImage = useProdDetail.use.activeImage();
  const chosenChild = useProdDetail.use.chosenChild();
  const {
    changeParent,
    changeChild,
    setMainImage,
    setActiveImage,
    changeVarCombination,
  } = useProdDetail.getState();
  const { setItemAmount } = useAmount.getState();
  // const [disableCheck, setDisableCheck] = useState<boolean>(false);

  if (!variants || !childVariants) {
    return <Skeleton className="h-5 w-full" />;
  }

  return (
    <>
      {variants.length > 0 && (
        <div className=" mt-5 space-y-7 border-t-[1px] border-border pt-3">
          <div className=" space-y-5">
            <div>
              <p className="font-bold">
                Choose by {variants[0].parent_group}:{" "}
                <span className="text-primary">
                  {variants[choosenParent].parent_name}
                </span>{" "}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {variants.map((variant, i) => {
                return (
                  <VariantButton
                    onClick={() => {
                      changeVarCombination(
                        childVariants[choosenParent].variant_child[0]
                          .variant_combination_product_id as number,
                      );
                      changeParent(i);
                      changeChild(0);
                      setItemAmount(1);
                      // setDisableCheck(false);
                      setMainImage(
                        variant.parent_picture
                          ? (variant.parent_picture as string)
                          : "",
                      );
                      setActiveImage(
                        variant.parent_picture
                          ? totalDefImage + i
                          : activeImage,
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
          <div className=" space-y-5">
            <div>
              <p className="font-bold">
                Choose by {childVariants[0].variant_child[0].child_group}:{" "}
                <span className="text-primary">
                  {
                    childVariants[choosenParent].variant_child[chosenChild]
                      .child_name
                  }
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {childVariants[choosenParent].variant_child.map((childVar, i) => {
                return (
                  <VariantButton
                    onClick={() => {
                      changeVarCombination(
                        childVariants[choosenParent].variant_child[i]
                          .variant_combination_product_id as number,
                      );
                      changeChild(i);
                      setItemAmount(1);
                    }}
                    disabled={childVar.stock === 0}
                    key={childVar.child_name}
                    isActive={i === chosenChild}
                  >
                    {childVar.child_picture && (
                      <Image
                        className="rounded-lg"
                        alt={childVar.child_name}
                        height={30}
                        width={30}
                        src={childVar.child_picture}
                        loading="lazy"
                      />
                    )}
                    {childVar.child_name}
                  </VariantButton>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductParentHasChild;
