import React from "react";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { formatIDR } from "@/utils/formatIDR";
import { ISellerPromoDetail } from "@/interfaces/promo";
import { formatDateLong } from "@/utils/formatDateLong";

interface IMyPromoRow {
  promo: ISellerPromoDetail;
}

const MyPromoRow = ({ promo }: IMyPromoRow) => {
  return (
    <tr
      key={promo.id}
      className="h-32 cursor-pointer border-b-[1px] border-primary transition hover:bg-primary/10 hover:text-primary hover:transition "
    >
      <td className="px-2 py-4">
        <p className="line-clamp-1">{promo.voucher_code}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{promo.name}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{promo.promotion_type}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">
          {promo.promotion_type === "CUT"
            ? formatIDR(promo.amount)
            : `${parseFloat(promo.amount) * 100}%`}
        </p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-4">
          {promo.max_amount ? formatIDR(promo.max_amount) : "-"}
        </p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{formatDateLong(promo.start_date)}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{formatDateLong(promo.end_date)}</p>
      </td>
      <td className="px-2 py-4">
        {promo.products
          ? promo.products.map((item, i) => {
              if (i < 2) {
                return (
                  <div key={item.id} className="flex items-center">
                    <ImageWithFallback
                      alt={`${item.id}`}
                      className="min-h-[20%] min-w-[20%] p-2"
                      src={item.photo}
                      height={50}
                      width={50}
                      loading="lazy"
                    />
                    <div>
                      <p className=" line-clamp-1">{item.title}</p>
                      <p className=" line-clamp-1">
                        {formatIDR(item.min_price)}
                      </p>
                    </div>
                  </div>
                );
              }
              if (i === 2 && promo.products) {
                return (
                  <p key={`rest-${i}`}>and {promo.products.length - 2} more</p>
                );
              }
            })
          : "-"}
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">
          {promo.promotion_scope === "MERCHANT"
            ? promo.promotion_scope
            : "PRODUCT"}
        </p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{promo.promotion_status}</p>
      </td>
    </tr>
  );
};

export default MyPromoRow;
