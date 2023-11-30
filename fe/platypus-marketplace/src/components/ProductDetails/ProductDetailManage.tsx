import React from "react";
import ManageAmount from "../Counter/ManageAmount";
import { formatIDR } from "@/utils/formatIDR";
import { useAmount } from "@/store/amount/useAmount";
import { IoCartOutline } from "react-icons/io5";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import { Skeleton } from "../ui/skeleton";
import VariantButton from "../Button/VariantButton/VariantButton";
import Image from "next/image";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import service from "@/services/services";
import { useLoading } from "@/store/loading/useLoading";
import { toast } from "../ui/use-toast";
import { useUser } from "@/store/user/useUser";

const ProductDetailManage = () => {
  const userData = useUser.use.userData();
  const itemAmount = useAmount.use.itemAmount();
  const variants = useProdDetail.use.parentVariants();
  const variantType = useProdDetail.use.variantType();
  const childVariants = useProdDetail.use.childVariants();
  const chosenChild = useProdDetail.use.chosenChild();
  const choosenParent = useProdDetail.use.chosenParent();
  const isFavorite = useProdDetail.use.isFavorite();
  const chosenVariantCombination = useProdDetail.use.chosenVariantCombination();
  const { likeProduct, dislikeProduct } = useProdDetail.getState();
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();

  if (!variants) {
    return <Skeleton className="h-5 w-full" />;
  }

  const handleAddToCart = async () => {
    showLoadingSm();
    let payload = {
      variant_combination_product_id: chosenVariantCombination,
      stock: itemAmount,
    };
    const { error } = await service.postAddToCart(payload);

    if (error) {
      hideLoadingSm();
    } else {
      hideLoadingSm();
      toast({ title: "Success add to cart", variant: "success" });
    }
  };

  return (
    <div className=" flex h-full flex-col justify-between gap-3">
      <h2 className="font-bold">Manage Amount</h2>
      <div>
        {variants && variants.length > 1 && (
          <VariantButton key={variants[choosenParent].parent_name} isActive>
            {variants[choosenParent].parent_picture && (
              <Image
                className="rounded-lg"
                alt={variants[choosenParent].parent_group}
                height={30}
                width={30}
                src={variants[choosenParent].parent_picture as string}
                loading="lazy"
              />
            )}
            {variants[choosenParent].parent_name}
            {variantType === "child" &&
              childVariants &&
              `, ${childVariants[choosenParent].variant_child[chosenChild].child_name}`}
          </VariantButton>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {variantType === "parent" &&
            variants[choosenParent].stock !== undefined && (
              <ManageAmount
                className="w-32"
                maxIncrease={
                  variantType === "parent"
                    ? variants[choosenParent].stock
                    : childVariants &&
                      childVariants[choosenParent].variant_child[chosenChild]
                        .stock
                }
              />
            )}
          {variantType === "child" &&
            childVariants &&
            childVariants[choosenParent].variant_child[chosenChild].stock !==
              undefined && (
              <ManageAmount
                className="w-32"
                maxIncrease={
                  childVariants &&
                  childVariants[choosenParent].variant_child[chosenChild].stock
                }
              />
            )}
        </div>
      </div>
      <div className="flex gap-1">
        <p>Stock:</p>
        <p className="line-clamp-1 font-bold">
          {variantType === "parent" && variants[choosenParent].stock
            ? variants[choosenParent].stock
            : !childVariants && 0}
          {variantType === "child" &&
          childVariants &&
          childVariants[choosenParent].variant_child[chosenChild].stock
            ? childVariants[choosenParent].variant_child[chosenChild].stock
            : childVariants && 0}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="self-end font-thin">Sub Total</p>
        {variantType === "parent" && (
          <div>
            <p className="text-lg font-bold">
              {isNaN(itemAmount)
                ? `Rp0`
                : formatIDR(
                    parseInt(variants[choosenParent].price) * itemAmount,
                  )}
            </p>
          </div>
        )}
        {variantType === "child" && childVariants && (
          <div>
            <p className="text-right text-sm text-muted-foreground line-through decoration-primary">
              {isNaN(itemAmount)
                ? `Rp0`
                : formatIDR(
                    parseInt(
                      childVariants[choosenParent].variant_child[chosenChild]
                        .price,
                    ) * itemAmount,
                  )}
            </p>
            <p className="text-lg font-bold">
              {isNaN(itemAmount)
                ? `Rp0`
                : formatIDR(
                    parseInt(
                      childVariants[choosenParent].variant_child[chosenChild]
                        .price,
                    ) * itemAmount,
                  )}
            </p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <ButtonWithLoading
          disabled={
            isNaN(itemAmount) || variantType === "parent"
              ? variants[choosenParent].stock === undefined
              : childVariants![choosenParent].variant_child[chosenChild]
                  .stock === undefined
          }
          buttonContent={
            <div className="flex items-center gap-1">
              <IoCartOutline />
              Add To Cart
            </div>
          }
          onClick={handleAddToCart}
          loadingContent="Adding to cart..."
          className="w-full"
        ></ButtonWithLoading>
        <ButtonWithLoading
          disabled={!userData}
          onClick={() => {
            isFavorite ? dislikeProduct() : likeProduct();
          }}
          buttonContent={
            <div className="flex items-center gap-1">
              {isFavorite ? (
                <FaHeart className="animate-quantum_bouncing text-red-500" />
              ) : (
                <FaRegHeart />
              )}
              Favorite
            </div>
          }
          variant={isFavorite ? "default" : "secondary"}
          className="w-full"
        ></ButtonWithLoading>
      </div>
    </div>
  );
};

export default ProductDetailManage;
