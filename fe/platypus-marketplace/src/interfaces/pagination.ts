export interface IPaginationData {
  total_items: number;
  total_pages: number;
  current_page: number;
}

export interface IReviewFilter {
  page: number;
  sort: "oldest" | "newest";
  images: boolean;
  comment: boolean;
  rating: number;
}
