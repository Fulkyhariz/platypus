/*eslint no-unused-vars: "off"*/

import { ICategory, IProduct } from "@/pages";
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";
import { handleAxiosApiRequest } from "@/utils/handleAxiosApiRequest";
import { IPaginationData } from "@/interfaces/pagination";

type State = {
  products: IProduct[] | undefined;
  categories: ICategory[] | undefined;
  category: ICategory | undefined;
  pageInformation: IPaginationData | undefined;
};

type Actions = {
  setProducts: (products: IProduct[]) => void;
  setPaginationInfo: (paginationInfo: IPaginationData) => void;
  getFilterSortSearch: (
    q: string,
    sort_by: string,
    sort: string,
    categoryId: string,
    location: string,
    min_price: string,
    max_price: string,
    min_rating: string,
    page: number,
  ) => void;
  getAllCategory: () => void;
  getCategoryById: (id: string) => void;
};

const paramQuery = async (
  q: string,
  sort_by: string,
  sort: string,
  categoryId: string,
  location: string,
  min_price: string,
  max_price: string,
  min_rating: string,
  page: number,
) => {
  const params: any = { page: page };
  if (q) {
    params.q = q;
  }
  if (sort_by) {
    params.sort_by = sort_by;
  }
  if (sort) {
    params.sort = sort;
  }
  if (categoryId) {
    params.category = categoryId;
  }
  if (location) {
    params.location = location;
  }
  if (min_price) {
    params.min_price = min_price;
  }
  if (max_price) {
    params.max_price = max_price;
  }
  if (min_rating) {
    params.min_rating = min_rating;
  }

  return handleAxiosApiRequest<any>(
    "GET",
    `${process.env.BASE_API_URL}/products`,
    { params },
  );
};

const useProductsBase = create<State & Actions>((set) => ({
  products: undefined,
  categories: undefined,
  category: undefined,
  pageInformation: undefined,
  setProducts: (products: IProduct[]) => set(() => ({ products: products })),
  setPaginationInfo: (paginationInfo: IPaginationData) => {
    set(() => ({ pageInformation: paginationInfo }));
  },
  getFilterSortSearch: async (
    q: string = "",
    sort_by: string = "",
    sort: string = "",
    categoryId: string = "",
    location: string = "",
    min_price: string = "",
    max_price: string = "",
    min_rating: string = "",
    page: number = 1,
  ) => {
    const { error, message, data, code } = await paramQuery(
      q,
      sort_by,
      sort,
      categoryId,
      location,
      min_price,
      max_price,
      min_rating,
      page,
    );

    set(() => ({
      products: data.data,
      pageInformation: data.meta.pagination_info,
    }));
  },
  getAllCategory: async () => {
    const responseCategories = await fetch(
      `${process.env.BASE_API_URL}/categories`,
    );

    const resultJSONCategories = await responseCategories.json();
    const categories = resultJSONCategories.data;
    set(() => ({ categories: categories }));
  },
  getCategoryById: async (id: string) => {
    const responseCategoryById = await fetch(
      `${process.env.BASE_API_URL}/categories/${id}`,
    );
    const resultJSONCategoryById = await responseCategoryById.json();
    const category = resultJSONCategoryById.data;
    set(() => ({ category: category }));
  },
}));

export const useProducts = createZusSelector(useProductsBase);
