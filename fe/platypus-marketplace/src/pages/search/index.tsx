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
import { IProduct } from "../";
import { ratingFormat } from "@/utils/uniUtils";
import { useProducts } from "@/store/products/useProducts";
import Link from "next/link";
import { useFilter } from "@/store/filter/useFilter";
import { GrFormNextLink } from "react-icons/gr";
import Head from "next/head";
import UniPagination from "@/components/Pagination/UniPagination";
import { IPaginationData } from "@/interfaces/pagination";

export interface ISearchProps {
  products: IProduct[];
  pagination_info: IPaginationData;
}

const Search = ({ products, pagination_info }: ISearchProps) => {
  const { setProducts, getFilterSortSearch, setPaginationInfo } =
    useProducts.getState();
  const { setSortBy, setSort } = useFilter.getState();
  const pageInformation = useProducts.use.pageInformation();
  const [filter, setFilter] = useState("");
  const [pageManagement, setPageManagement] = useState<{
    page: number;
  }>({
    page: 1,
  });

  const productsData = useProducts.use.products();

  const categoryFilter = useFilter.use.category();
  const locationFilter = useFilter.use.location();
  const minPriceFilter = useFilter.use.min_price();
  const maxPriceFilter = useFilter.use.max_price();
  const minRatingFilter = useFilter.use.min_rating();

  useEffect(() => {
    setPageManagement({ page: 1 });
  }, []);

  useEffect(() => {
    // if (pageManagement.page === 1) {
    if (products && pageManagement.page === 1) {
      setProducts(products);
      setPaginationInfo(pagination_info);
    }
    if (products && pageManagement.page > 1) {
      // setPaginationInfo(pagination_info);
      if (filter === "") {
        getFilterSortSearch(
          "",
          "",
          "",
          categoryFilter as string,
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
          "",
          "date",
          "desc",
          categoryFilter as string,
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
          "",
          "total_sold",
          "desc",
          categoryFilter as string,
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
          "",
          "price",
          "desc",
          categoryFilter as string,
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
          "",
          "price",
          "asc",
          categoryFilter as string,
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
        "",
        "date",
        "desc",
        categoryFilter as string,
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
        "",
        "total_sold",
        "desc",
        categoryFilter as string,
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
        "",
        "price",
        "desc",
        categoryFilter as string,
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
        "",
        "price",
        "asc",
        categoryFilter as string,
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
      <main className="min-w-screen flex min-h-screen flex-col items-center justify-center pt-12 md:px-28 md:pt-28 2xl:px-72">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Search | Platypus</title>
        <meta name="platypus" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/vm4/favicon.ico" />
      </Head>
      <main className="min-w-screen flex min-h-screen flex-col items-center pt-12 md:px-28 md:pt-28 2xl:px-72">
        <div className="w-[93%] md:w-full">
          <div className="mt-5 flex items-center gap-2">
            <Link
              href={`/`}
              className="font-semibold text-primary hover:text-black"
            >
              Home
            </Link>
            <GrFormNextLink />
            <Link
              href={`#`}
              className="font-semibold text-primary hover:text-black"
            >
              Search
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
                <h2 className="font-medium md:text-lg">Search Page</h2>
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

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await fetch(`${process.env.BASE_API_URL}/products`);
  const resultJSON = await response.json();
  const products = resultJSON.data;
  const pagination_info = resultJSON.meta.pagination_info;

  return {
    props: {
      products,
      pagination_info,
    },
  };
};

export default Search;
