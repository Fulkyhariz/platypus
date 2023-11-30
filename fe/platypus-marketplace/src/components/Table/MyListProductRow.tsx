import { IProductMyList } from "@/interfaces/product";
import React, { useState } from "react";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { BsStarFill } from "react-icons/bs";
import { formatIDR } from "@/utils/formatIDR";
import { formatDateLong } from "@/utils/formatDateLong";
import Link from "next/link";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";

interface IMyListProductRow {
  product: IProductMyList;
}

const MyListProductRow = ({ product }: IMyListProductRow) => {
  const [prodActive, setProdActive] = useState<boolean>(product.is_active);
  const { toast } = useToast();
  const toggleActive = async () => {
    setProdActive((prev) => !prev);

    if (prodActive) {
      const { error, data } = await service.deactiveProduct({
        product_id: product.id,
      });
      if (error) {
        toast({
          title: "Failed to deactivate product",
          variant: "destructive",
        });
      } else {
        toast({
          title: data.message,
          description: product.title,
          variant: "success",
        });
      }
    } else {
      const { error, data } = await service.activateProduct({
        product_id: product.id,
      });
      if (error) {
        toast({
          title: "Failed to activate product",
          variant: "destructive",
        });
      } else {
        toast({
          title: data.message,
          description: product.title,
          variant: "success",
        });
      }
    }
  };
  // `/merchant-center/edit-product/${product.id}`;
  return (
    <tr
      // onClick={() => router.push(`/merchant-center/edit-product/${product.id}`)}
      key={product.id}
      className="border-b-[1px] border-primary hover:bg-primary/10 "
    >
      <td className="px-2 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/merchant-center/edit-product/${product.id}`}
            className="h-10 w-10"
          >
            <ImageWithFallback
              className="h-10 w-10 rounded-lg object-cover transition hover:border-[1px] hover:border-primary hover:transition"
              alt="owner-img"
              src={product.photo}
              height={50}
              width={50}
              loading="lazy"
            />
          </Link>
          <Link
            href={`/merchant-center/edit-product/${product.id}`}
            className={`flex-1 transition-colors hover:text-primary hover:transition-colors`}
          >
            <p className={` line-clamp-2`}>{product.title}</p>
          </Link>
        </div>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{formatIDR(product.min_price)}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{product.total_stock}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{product.total_sold}</p>
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-3">
          <p className="line-clamp-1">{product.average_rating}</p>
          <BsStarFill className="text-yellow-500" />
        </div>
      </td>
      <td className="px-2 py-4">
        <input
          onChange={toggleActive}
          type="checkbox"
          className="toggle toggle-success"
          checked={prodActive}
        />
      </td>
      <td className="px-2 py-4">{formatDateLong(product.created_at)}</td>
    </tr>
  );
};

export default MyListProductRow;
