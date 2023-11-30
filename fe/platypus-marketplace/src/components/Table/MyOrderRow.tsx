import React from "react";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { formatIDR } from "@/utils/formatIDR";
import { ISellerOrderList } from "@/interfaces/order";
import { formatDate } from "@/utils/formatDate";
import { useModal } from "@/store/modal/useModal";
import OrderDetail from "./OrderDetail";

interface IMyOrderRow {
  order: ISellerOrderList;
  page: number;
}

const MyOrderRow = ({ order, page }: IMyOrderRow) => {
  const { showModal } = useModal.getState();

  const onShowDetailOrder = () => {
    showModal(<OrderDetail page={page} orderId={order.order_detail_id} />);
  };

  return (
    <tr
      onClick={onShowDetailOrder}
      key={order.order_detail_id}
      className="h-32 cursor-pointer border-b-[1px] border-primary transition hover:bg-primary/10 hover:text-primary hover:transition "
    >
      <td className="px-2 py-4">
        <p className="line-clamp-1">{order.username}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{formatIDR(order.initial_price)}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{formatIDR(order.final_price)}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-4">{order.address}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{order.courier_id}</p>
      </td>
      <td className="px-2 py-4">
        {order.product.map((item, i) => {
          if (i < 2) {
            return (
              <div key={item.product_id} className="flex items-center">
                <ImageWithFallback
                  alt={`${item.product_id}`}
                  key={`img${item.product_id}`}
                  className="min-h-[20%] min-w-[20%] p-2"
                  src={item.photo}
                  height={50}
                  width={50}
                  loading="lazy"
                />
                <div>
                  <p className=" line-clamp-1">{item.product_name}</p>
                  <p className=" line-clamp-1">
                    {formatIDR(item.product_price)}
                  </p>
                </div>
              </div>
            );
          }
          if (i === 2) {
            return <p key={`rest-${i}`}>and {order.product.length - 2} more</p>;
          }
        })}
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-1">{formatDate(order.estimated_time)}</p>
      </td>
      <td className="px-2 py-4">
        <p className="line-clamp-2">{order.status}</p>
      </td>
    </tr>
  );
};

export default MyOrderRow;
