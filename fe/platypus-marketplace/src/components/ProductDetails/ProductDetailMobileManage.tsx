import React from "react";
import { useAmount } from "@/store/amount/useAmount";
import { IoCartOutline } from "react-icons/io5";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import { Skeleton } from "../ui/skeleton";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import service from "@/services/services";
import { useLoading } from "@/store/loading/useLoading";
import { toast } from "../ui/use-toast";

const ProductDetailMobileManage = () => {
  const itemAmount = useAmount.use.itemAmount();
  const variants = useProdDetail.use.parentVariants();
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
    <div className="fixed inset-x-0 bottom-0 z-[100] flex h-14 w-full items-center justify-center gap-3 overflow-y-scroll border-t-[1px] bg-background px-3 shadow-drop-line lg:hidden">
      <ButtonWithLoading
        disabled={isNaN(itemAmount)}
        buttonContent={
          <div className="flex items-center gap-1">
            <IoCartOutline />
            Add To Cart
          </div>
        }
        className="flex-1"
        onClick={handleAddToCart}
        loadingContent="Adding to cart..."
      ></ButtonWithLoading>
      <ButtonWithLoading
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
        className="flex-1"
        variant={isFavorite ? "default" : "secondary"}
      ></ButtonWithLoading>
    </div>
  );
};

export default ProductDetailMobileManage;
