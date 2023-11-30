import React from "react";
import ProductCard from "../Card/ProductCard";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import { Skeleton } from "../ui/skeleton";
import { IProductMerchantRecommendation } from "@/interfaces/productDetail";
import { ratingFormat } from "@/utils/uniUtils";

const ProductDetailRecommendation = () => {
  const merchantProducts = useProdDetail.use.merchantProducts();

  if (!merchantProducts) {
    return (
      <div className="grid grid-cols-base-rec-card justify-between gap-2 gap-y-3 md:grid-cols-md-rec-card md:gap-y-10 md:py-10 xl:grid-cols-xl-rec-card">
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
        <Skeleton className=" h-72 w-full" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-base-rec-card justify-between gap-2 gap-y-3 md:grid-cols-md-rec-card md:gap-y-10 md:py-10 xl:grid-cols-xl-rec-card">
      {merchantProducts.map((product: IProductMerchantRecommendation) => {
        return (
          <ProductCard
            id={product.id}
            url={product.photo}
            key={product.id}
            name={product.title}
            price={parseInt(product.min_price)}
            rating={ratingFormat(product.average_rating)}
            city={product.city}
            sold={product.total_sold}
          />
        );
      })}
    </div>
  );
};

export default ProductDetailRecommendation;
