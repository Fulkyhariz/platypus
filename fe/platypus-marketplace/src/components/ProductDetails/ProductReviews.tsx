import React, { useEffect } from "react";
import UserReview from "./UserReview";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import { Skeleton } from "../ui/skeleton";
import UniPagination from "../Pagination/UniPagination";
import { IProductReviews } from "@/interfaces/productReview";
import PlatypusHead from "../SVG/PlatypusHead";

const ProductReviews = ({
  product_id,
  reviewManagement,
  onClickChangePage,
  onClickNextChangePage,
  onClickPrevChangePage,
}: IProductReviews) => {
  const { getProductReview } = useProdDetail.getState();
  const productReview = useProdDetail.use.productReview();
  const pageInformation = useProdDetail.use.pageInformation();

  useEffect(() => {
    getProductReview(
      product_id,
      reviewManagement.page,
      reviewManagement.sort,
      reviewManagement.images,
      reviewManagement.comment,
      reviewManagement.rating,
    );
  }, [reviewManagement, product_id]);

  if (!productReview || !pageInformation) {
    return (
      <div className="flex h-full w-full flex-col gap-3">
        <Skeleton className="h-[20%] w-full" />
        <Skeleton className="h-[20%] w-full" />
        <Skeleton className="h-[20%] w-full" />
        <Skeleton className="h-[20%] w-full" />
        <Skeleton className="h-[20%] w-full" />
      </div>
    );
  }
  return (
    <div className="w-full">
      {productReview.length < 1 ? (
        <div className="flex justify-center">
          <PlatypusHead className="h-32 w-32" />
          <p className="self-end text-2xl font-bold text-primary lg:text-4xl">
            No review yet
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-primary">Users Review</h2>
          {productReview.map((review) => (
            <UserReview key={review.id} review={review} />
          ))}
          <div className="mt-5 flex items-start justify-center">
            <UniPagination
              onClickChangePage={onClickChangePage}
              onClickNextChangePage={onClickNextChangePage}
              onClickPrevChangePage={onClickPrevChangePage}
              pageInformation={pageInformation}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductReviews;
