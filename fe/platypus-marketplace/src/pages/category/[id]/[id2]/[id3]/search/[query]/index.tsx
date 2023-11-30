import React, { ReactElement, useEffect, useState } from "react";
import ProductCard from "@/components/Card/ProductCard";
import { IoMdInformationCircle } from "react-icons/io";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserLayout from "@/components/Layout/UserLayout";
import { FilterSearchForm } from "@/components/Form/FilterSearchForm";
import { BiFilterAlt } from "react-icons/bi";
import { GetServerSideProps } from "next";
import { ratingFormat } from "@/utils/uniUtils";
import { useProducts } from "@/store/products/useProducts";
import { IProduct } from "@/pages";
import { ICategory } from "../..";
import Link from "next/link";
import { GrFormNextLink } from "react-icons/gr";
import { useFilter } from "@/store/filter/useFilter";
import Head from "next/head";
import { IPaginationData } from "@/interfaces/pagination";
import UniPagination from "@/components/Pagination/UniPagination";

export interface ISearchProps {
  products: IProduct[];
  paramQuery: string;
  category: ICategory;
  categoryLv1: ICategory;
  categoryLv2: ICategory;
  pagination_info: IPaginationData;
}

const Search = ({
  products,
  paramQuery,
  category,
  categoryLv1,
  categoryLv2,
  pagination_info,
}: ISearchProps) => {
  const { setProducts, getFilterSortSearch, setPaginationInfo } =
    useProducts.getState();
  const { setQ, setSortBy, setSort, setCategory } = useFilter.getState();
  setQ(paramQuery);
  setCategory(category.id);

  const productsData = useProducts.use.products();
  const pageInformation = useProducts.use.pageInformation();
  const locationFilter = useFilter.use.location();
  const minPriceFilter = useFilter.use.min_price();
  const maxPriceFilter = useFilter.use.max_price();
  const minRatingFilter = useFilter.use.min_rating();
  const [filter, setFilter] = useState("");
  const [pageManagement, setPageManagement] = useState<{
    page: number;
  }>({
    page: 1,
  });

  useEffect(() => {
    setPageManagement({ page: 1 });
  }, [paramQuery]);

  useEffect(() => {
    if (products && pageManagement.page === 1) {
      setProducts(products);
      setPaginationInfo(pagination_info);
    }

    if (products && pageManagement.page > 1) {
      if (filter === "") {
        getFilterSortSearch(
          paramQuery,
          "",
          "",
          category.id,
          locationFilter as string,
          minPriceFilter as string,
          maxPriceFilter as string,
          minRatingFilter as string,
          pageManagement.page,
        );
      }
      if (filter === "latest") {
        setSortBy("date");
        setSort("desc");
        getFilterSortSearch(
          paramQuery,
          "date",
          "desc",
          category.id,
          locationFilter as string,
          minPriceFilter as string,
          maxPriceFilter as string,
          minRatingFilter as string,
          pageManagement.page,
        );
      }
      if (filter === "most_purchased") {
        setSortBy("total_sold");
        setSort("desc");
        getFilterSortSearch(
          paramQuery,
          "total_sold",
          "desc",
          category.id,
          locationFilter as string,
          minPriceFilter as string,
          maxPriceFilter as string,
          minRatingFilter as string,
          pageManagement.page,
        );
      }
      if (filter === "expensive") {
        setSortBy("price");
        setSort("desc");
        getFilterSortSearch(
          paramQuery,
          "price",
          "desc",
          category.id,
          locationFilter as string,
          minPriceFilter as string,
          maxPriceFilter as string,
          minRatingFilter as string,
          pageManagement.page,
        );
      }
      if (filter === "cheapest") {
        setSortBy("price");
        setSort("asc");
        getFilterSortSearch(
          paramQuery,
          "price",
          "asc",
          category.id,
          locationFilter as string,
          minPriceFilter as string,
          maxPriceFilter as string,
          minRatingFilter as string,
          pageManagement.page,
        );
      }
    }
  }, [products, pageManagement]);

  const onClickChangePage = (key: string, value: number) => {
    setPageManagement({
      ...pageManagement,
      [key]: value,
    });
  };

  const onClickNextChangePage = (key: string) => {
    setPageManagement({
      ...pageManagement,
      [key]: pageManagement.page + 1,
    });
  };

  const onClickPrevChangePage = (key: string) => {
    setPageManagement({
      ...pageManagement,
      [key]: pageManagement.page - 1,
    });
  };

  function setQuery(value: string) {
    if (value === "latest") {
      setSortBy("date");
      setSort("desc");
      getFilterSortSearch(
        paramQuery,
        "date",
        "desc",
        category.id,
        locationFilter as string,
        minPriceFilter as string,
        maxPriceFilter as string,
        minRatingFilter as string,
        pageManagement.page,
      );
    }
    if (value === "most_purchased") {
      setSortBy("total_sold");
      setSort("desc");
      getFilterSortSearch(
        paramQuery,
        "total_sold",
        "desc",
        category.id,
        locationFilter as string,
        minPriceFilter as string,
        maxPriceFilter as string,
        minRatingFilter as string,
        pageManagement.page,
      );
    }
    if (value === "expensive") {
      setSortBy("price");
      setSort("desc");
      getFilterSortSearch(
        paramQuery,
        "price",
        "desc",
        category.id,
        locationFilter as string,
        minPriceFilter as string,
        maxPriceFilter as string,
        minRatingFilter as string,
        pageManagement.page,
      );
    }
    if (value === "cheapest") {
      setSortBy("price");
      setSort("asc");
      getFilterSortSearch(
        paramQuery,
        "price",
        "asc",
        category.id,
        locationFilter as string,
        minPriceFilter as string,
        maxPriceFilter as string,
        minRatingFilter as string,
        pageManagement.page,
      );
    }
  }

  if (!pageInformation || !productsData) {
    return (
      <>
        <Head>
          <title>Category {categoryLv2.name} | Platypus</title>
          <meta name="platypus" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/vm4/favicon.ico" />
        </Head>
        <main className="min-w-screen flex min-h-screen flex-col items-center justify-center pt-12 md:px-28 md:pt-28 2xl:px-72">
          <span className="loading loading-dots loading-lg text-primary"></span>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Category {categoryLv2.name} | Platypus</title>
        <meta name="platypus" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/vm4/favicon.ico" />
      </Head>
      <main className="min-w-screen flex min-h-screen flex-col items-center pt-12 md:px-28 md:pt-28 2xl:px-72">
        <div className="mt-5 w-[93%] md:w-full">
          <div className="flex items-center gap-2">
            <Link
              href={`/`}
              className="font-semibold text-primary hover:text-black"
            >
              Home
            </Link>
            <GrFormNextLink />
            <Link
              href={`/category`}
              className="font-semibold text-primary hover:text-black"
            >
              Categories
            </Link>
            <GrFormNextLink />
            <Link
              href={`/category/${categoryLv1.id.toLowerCase()}`}
              className="font-semibold text-primary hover:text-black"
            >
              {categoryLv1.name}
            </Link>
            <GrFormNextLink />
            <Link
              href={`/category/${categoryLv1.id.toLowerCase()}/${categoryLv2.id.toLowerCase()}`}
              className="font-semibold text-primary hover:text-black"
            >
              {categoryLv2.name}
            </Link>
            <GrFormNextLink />
            <Link
              href={`/category/${categoryLv1.id.toLowerCase()}/${categoryLv2.id.toLowerCase()}/${category.id.toLowerCase()}`}
              className="font-semibold text-primary hover:text-black"
            >
              {category.name}
            </Link>
            <GrFormNextLink />
          </div>

          <div className="mt-5 w-full md:flex lg:gap-16">
            <div className="hidden pt-1 lg:block">
              <div className="flex items-center">
                <BiFilterAlt />
                <p className="font-medium">&nbsp;Filter Search</p>
              </div>
              <p className="pb-5 text-sm">Choose your filters.</p>
              <FilterSearchForm />
            </div>
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2 md:mb-10">
                <IoMdInformationCircle className="w-5" />
                <h2 className="text-lg font-medium md:text-xl lg:text-xl">
                  Search Result for &quot;{paramQuery}&quot; in Category{" "}
                  {category.name}
                </h2>
              </div>
              <div className="flex">
                <Select
                  onValueChange={(e) => {
                    setQuery(e);
                    setFilter(e);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sort by</SelectLabel>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="most_purchased">
                        Most Purchased
                      </SelectItem>
                      <SelectItem value="expensive">Most expensive</SelectItem>
                      <SelectItem value="cheapest">Cheapest</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-5 flex justify-center">
                <UniPagination
                  onClickChangePage={onClickChangePage}
                  onClickNextChangePage={onClickNextChangePage}
                  onClickPrevChangePage={onClickPrevChangePage}
                  pageInformation={pageInformation}
                />
              </div>
              <div className="grid min-h-screen min-w-[348px] grid-cols-2-prod-card justify-evenly gap-2 gap-y-3 py-10 md:grid-cols-4-prod-card md:justify-center md:gap-4 md:gap-y-10">
                {productsData.length == 0 && (
                  <div className="">
                    <p className="md:px-1">No products to show.</p>
                  </div>
                )}
                {productsData.map((item: IProduct) => {
                  return (
                    <ProductCard
                      id={item.id}
                      url={item.photo}
                      key={item.id}
                      name={item.title}
                      price={parseInt(item.min_price)}
                      rating={ratingFormat(item.average_rating)}
                      city={item.city}
                      sold={item.total_sold}
                    />
                  );
                })}
              </div>
              <div className="mt-5 flex justify-center">
                <UniPagination
                  onClickChangePage={onClickChangePage}
                  onClickNextChangePage={onClickNextChangePage}
                  onClickPrevChangePage={onClickPrevChangePage}
                  pageInformation={pageInformation}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <UserLayout>{page}</UserLayout>;
};

export const getServerSideProps: GetServerSideProps = async (params) => {
  const paramQuery = params.query.query;
  if (
    (params.query.id && params.query.id[3] != "1") ||
    (params.query.id2 && params.query.id2[3] != "2") ||
    (params.query.id3 && params.query.id3[3] != "3")
  ) {
    return {
      notFound: true,
    };
  }

  const responseCategory = await fetch(
    `${process.env.BASE_API_URL}/categories/${params.query.id3}`,
  );
  const resultJSONCategory = await responseCategory.json();
  const category = resultJSONCategory.data;
  const responseCategoryLv1 = await fetch(
    `${process.env.BASE_API_URL}/categories/${params.query.id}`,
  );
  const resultJSONCategoryLv1 = await responseCategoryLv1.json();
  const categoryLv1 = resultJSONCategoryLv1.data;
  const responseCategoryLv2 = await fetch(
    `${process.env.BASE_API_URL}/categories/${params.query.id2}`,
  );
  const resultJSONCategoryLv2 = await responseCategoryLv2.json();
  const categoryLv2 = resultJSONCategoryLv2.data;
  if (!category || !categoryLv1 || !categoryLv2) {
    return {
      notFound: true,
    };
  }

  const responseProducts = await fetch(
    `${process.env.BASE_API_URL}/products?category=${params.query.id3}&q=${paramQuery}`,
  );
  const resultJSONProducts = await responseProducts.json();
  const products = resultJSONProducts.data;
  const pagination_info = resultJSONProducts.meta.pagination_info;

  return {
    props: {
      products,
      category,
      categoryLv1,
      categoryLv2,
      paramQuery,
      pagination_info,
    },
  };
};

export default Search;
