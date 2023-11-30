import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import Link from "next/link";
import React from "react";
import { Skeleton } from "../ui/skeleton";

const CategoryBreadcrumbs = () => {
  const categories = useProdDetail.use.categories();
  const productDetail = useProdDetail.use.productDetail();

  if (!categories || !productDetail) {
    return <Skeleton className="h-5 w-40" />;
  }

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li className="text-primary">
          <Link href={"/"}>Home</Link>
        </li>
        {categories.map((category, i) => {
          let linkCategory = "/category";
          for (let idx = 0; idx < i + 1; idx++) {
            linkCategory += `/${categories[idx].id}`;
          }
          return (
            <li key={category.id} className="text-primary">
              <Link href={`${linkCategory}`}>{category.name}</Link>
            </li>
          );
        })}
        <li>{productDetail.product_name}</li>
      </ul>
    </div>
  );
};

export default CategoryBreadcrumbs;
