import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import React from "react";
import { BsStarFill } from "react-icons/bs";
import { Skeleton } from "../ui/skeleton";
const ProductTitle = () => {
  const productData = useProdDetail.use.productDetail();
  const variants = useProdDetail.use.parentVariants();
  const variantType = useProdDetail.use.variantType();
  const childVariants = useProdDetail.use.childVariants();
  const choosenParent = useProdDetail.use.chosenParent();
  const chosenChild = useProdDetail.use.chosenChild();

  if (!productData || !variants) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-full rounded-lg" />
        <div className="grid w-full grid-cols-3 gap-5">
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="line-clamp-2 text-xl font-bold">
        {productData?.product_name}

        {variants?.length > 1 && ` - ${variants[choosenParent].parent_name}`}
        {variantType === "child" &&
          `, ${
            childVariants &&
            childVariants[choosenParent].variant_child[chosenChild].child_name
          }`}
      </h1>
      <div className="flex gap-5 text-sm">
        <p>
          Sold{" "}
          <span className=" text-muted-foreground">
            {productData.total_sold}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <BsStarFill className=" text-yellow-500 dark:text-primary" />
          <p>
            Rating{" "}
            <span className=" text-muted-foreground">
              ({productData.total_rating} rating)
            </span>
          </p>
        </div>
        <p>
          Favorites{" "}
          <span className=" text-muted-foreground">
            ({productData.favorite_count})
          </span>
        </p>
      </div>
    </div>
  );
};

export default ProductTitle;
