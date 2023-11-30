import React, { useState } from "react";
import ProductDetailReviewFilter from "./ProductDetailReviewFilter";
import ProductReviews from "./ProductReviews";
import { useNavBar } from "@/store/navbar/useNavBar";
import { IReviewFilter } from "@/interfaces/pagination";
import styles from "./ProductReviewContainer.module.scss";
import { Button } from "../ui/button";
import { useModal } from "@/store/modal/useModal";

interface IProductReviewContainer {
  id: number;
}

const ProductReviewContainer = ({ id }: IProductReviewContainer) => {
  const navHeight = useNavBar.use.navHeight();
  const { showModalUpSlide } = useModal.getState();
  const [reviewManagement, setReviewManagement] = useState<IReviewFilter>({
    page: 1,
    sort: "newest",
    images: false,
    comment: false,
    rating: 0,
  });

  const onClickChangePage = (key: string, value: number) => {
    setReviewManagement({
      ...reviewManagement,
      [key]: value,
    });
  };

  const onClickNextChangePage = (key: string) => {
    setReviewManagement({
      ...reviewManagement,
      [key]: reviewManagement.page + 1,
    });
  };

  const onClickPrevChangePage = (key: string) => {
    setReviewManagement({
      ...reviewManagement,
      [key]: reviewManagement.page - 1,
    });
  };

  const onChangeReviewFilter = (
    value: string | boolean | number,
    key: string,
  ) => {
    setReviewManagement({
      ...reviewManagement,
      page: 1,
      [key]: value,
    });
  };

  const onShowReviewFilter = () => {
    showModalUpSlide(
      <div className=" pb-14">
        <ProductDetailReviewFilter
          onChangeReviewFilter={onChangeReviewFilter}
        />
      </div>,
    );
  };

  return (
    <>
      <div
        style={{ top: `${navHeight + 20}px` }}
        className={`mt-[20px] h-fit border-[1px] border-border bg-background max-lg:hidden lg:sticky lg:left-0 lg:block lg:w-48 lg:rounded-lg xl:w-56 ${styles.mobileView}`}
      >
        <ProductDetailReviewFilter
          onChangeReviewFilter={onChangeReviewFilter}
        />
      </div>
      <Button
        className="mt-10 lg:hidden"
        variant="outline"
        type="button"
        onClick={onShowReviewFilter}
      >
        Filter Review
      </Button>
      <div className=" w-full px-3 pt-[3.750rem] lg:px-5 xl:px-10">
        <ProductReviews
          onClickChangePage={onClickChangePage}
          onClickNextChangePage={onClickNextChangePage}
          onClickPrevChangePage={onClickPrevChangePage}
          product_id={id}
          reviewManagement={reviewManagement}
        />
      </div>
    </>
  );
};

export default ProductReviewContainer;
