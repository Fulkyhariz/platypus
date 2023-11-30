import { IPaginationData, IReviewFilter } from "./pagination";

export interface IReview {
  id: number;
  user_name: string;
  rating: number;
  profile_picture: string;
  images: string[] | null;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface IProductReviews {
  product_id: number;
  reviewManagement: IReviewFilter;
  onClickChangePage: (key: string, value: number) => void;
  onClickNextChangePage: (key: string) => void;
  onClickPrevChangePage: (key: string) => void;
}

export interface IProductDetailReviewFilter {
  onChangeReviewFilter: (value: string | boolean | number, key: string) => void;
}

export interface IUniPagination {
  onClickChangePage: (key: string, value: number) => void;
  onClickNextChangePage: (key: string) => void;
  onClickPrevChangePage: (key: string) => void;
  pageInformation: IPaginationData;
}
