/*eslint no-unused-vars: "off"*/
import { IProductMyList } from "@/interfaces/product";
import React from "react";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { BsStarFill } from "react-icons/bs";
import { formatIDR } from "@/utils/formatIDR";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";

interface IProductListPromotionRow {
  product: IProductMyList;
  onCheckProduct: (id: number, type: boolean) => void;
  choosenProduct: number[];
}

const ProductListPromotionRow = ({
  product,
  onCheckProduct,
  choosenProduct,
}: IProductListPromotionRow) => {
  return (
    <tr
      key={product.id}
      className="border-b-[1px] border-primary hover:bg-primary/10 "
    >
      <td className="px-2 py-4 text-center">
        <Checkbox
          id="images"
          checked={choosenProduct.some((idProd) => idProd === product.id)}
          // defaultChecked={choosenProduct.some(
          //   (idProd) => idProd === product.id,
          // )}
          onCheckedChange={(checked) => {
            checked
              ? onCheckProduct(product.id, true)
              : onCheckProduct(product.id, false);
          }}
        />
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10">
            <ImageWithFallback
              className="h-10 w-10 rounded-lg object-cover transition hover:border-[1px] hover:border-primary hover:transition"
              alt="owner-img"
              src={product.photo}
              height={50}
              width={50}
              loading="lazy"
            />
          </div>
          <div
            className={`flex-1 transition-colors hover:text-primary hover:transition-colors`}
          >
            <p className={` line-clamp-2`}>{product.title}</p>
          </div>
        </div>
      </td>

      <td className="px-2 py-4">
        <p className="line-clamp-1">{formatIDR(product.min_price)}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{product.total_stock}</p>
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-3">
          <p className="line-clamp-1">{product.average_rating}</p>
          <BsStarFill className="text-yellow-500" />
        </div>
      </td>
      <td className="px-2 py-4">{product.id}</td>
    </tr>
  );
};

export default ProductListPromotionRow;
