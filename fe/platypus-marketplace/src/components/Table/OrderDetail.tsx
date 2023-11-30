import { IDetailOrderData } from "@/interfaces/order";
import service from "@/services/services";
import React, { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import ImageWithFallback from "../ImageWithFallback/ImageWithFallback";
import { formatIDR } from "@/utils/formatIDR";
import { formatDateLong } from "@/utils/formatDateLong";
import UpdateButton from "../Button/UpdateButton/UpdateButton";
import { IoReloadCircleOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { LiaSubwaySolid } from "react-icons/lia";
import { useModal } from "@/store/modal/useModal";
import { useMyOrder } from "@/store/myOrder/useMyOrder";
import { FaBox, FaCheckCircle } from "react-icons/fa";

interface IOrderDetail {
  orderId: number;
  page: number;
}

const OrderDetail = ({ orderId, page }: IOrderDetail) => {
  const [orderDetail, setOrderDetail] = useState<IDetailOrderData>();

  const [status, setStatus] = useState<number>(0);
  const { hideModal } = useModal.getState();
  const { getOrderList } = useMyOrder();
  const { toast } = useToast();

  const updateToProcess = async () => {
    const { error, data } = await service.putToProcess({
      order_detail_id: orderId,
    });

    if (error) {
      toast({ title: data.message, variant: "destructive" });
    } else {
      toast({ title: data.message, variant: "success" });
      getOrderList(page);
      hideModal();
    }
  };

  const updateToDeliver = async () => {
    const { error, data } = await service.putToDelivery({
      order_detail_id: orderId,
    });

    if (error) {
      toast({ title: data.message, variant: "destructive" });
    } else {
      toast({ title: data.message, variant: "success" });
      getOrderList(page);
      hideModal();
    }
  };

  useEffect(() => {
    const getDetail = async () => {
      const { error, data } = await service.getOrderDetail(orderId);
      const statusOrder = data.data.status;
      if (statusOrder === "Waiting for Seller") {
        setStatus(1);
      } else if (statusOrder === "Processed") {
        setStatus(2);
      } else if (statusOrder === "On Delivery") {
        setStatus(3);
      } else if (statusOrder === "Delivered") {
        setStatus(4);
      } else if (statusOrder === "Completed") {
        setStatus(5);
      } else {
        setStatus(0);
      }
      if (error) {
        toast({ title: data.message, variant: "destructive" });
      } else {
        setOrderDetail(data.data);
      }
    };
    getDetail();
  }, [orderId]);

  if (!orderDetail) {
    return (
      <div className="p-5">
        <span className="loading loading-dots loading-lg text-primary"></span>
      </div>
    );
  }

  const urlCourier: string =
    orderDetail.courier_id.toLowerCase() === "jne"
      ? "https://res.cloudinary.com/dro3sbdac/image/upload/v1700725973/h4hvburldrz5gbhpy0cg.png"
      : orderDetail.courier_id.toLowerCase() === "pos"
      ? "https://res.cloudinary.com/dro3sbdac/image/upload/v1700726568/wvkxuc3vmunko6bmj1av.png"
      : orderDetail.courier_id.toLowerCase() === "tiki"
      ? "https://res.cloudinary.com/dro3sbdac/image/upload/v1700725953/cuwknhoddihpy8eiebmn.png"
      : "";

  return (
    <div className="max-h-[90vh] overflow-y-scroll p-10">
      <div className="flex justify-center">
        <ul className="timeline">
          <li>
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`${status > 0 && "text-primary"} h-8 w-8`}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end timeline-box">Waiting for Seller</div>
            <hr className={`${status > 0 && "bg-primary"}`} />
          </li>
          <li>
            <hr className={`${status > 1 && "bg-primary"}`} />
            <div className="timeline-start timeline-box">Processed</div>
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`${status > 1 && "text-primary"} h-8 w-8`}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <hr className={`${status > 1 && "bg-primary"}`} />
          </li>
          <li>
            <hr className={`${status > 2 && "bg-primary"}`} />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`${status > 2 && "text-primary"} h-8 w-8`}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end timeline-box">On Delivery</div>
            <hr className={`${status > 2 && "bg-primary"}`} />
          </li>
          <li>
            <hr className={`${status > 3 && "bg-primary"}`} />
            <div className="timeline-start timeline-box">Delivered</div>
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`${status > 3 && "text-primary"} h-8 w-8`}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <hr className={`${status > 3 && "bg-primary"}`} />
          </li>
          <li>
            <hr className={`${status > 4 && "bg-primary"}`} />
            <div className="timeline-middle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`${status > 4 && "text-primary"} h-8 w-8`}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="timeline-end timeline-box">Completed</div>
          </li>
        </ul>
      </div>
      <div className="mt-3 rounded-lg border-[1px] border-primary p-3">
        <div className="flex justify-between text-sm">
          <div>
            <p>Courier Service</p>
            <ImageWithFallback
              alt={orderDetail.courier_id.toLowerCase()}
              src={urlCourier}
              className="object-contain"
              height={100}
              width={100}
            />
          </div>
          <div>
            <p>Invoce</p>
            <p>{orderDetail.invoice}</p>
          </div>
          <div>
            <p>ETA</p>
            <p>{formatDateLong(orderDetail.estimated_time)}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-between rounded-lg border-[1px] border-primary p-3">
        <div>
          <p>Buyer Username</p>
          <p>{orderDetail.username}</p>
        </div>
        <div className="flex items-center">
          {status === 1 && (
            <UpdateButton
              type="button"
              icon={<IoReloadCircleOutline className="h-full w-full" />}
              wmax
              ship
              onClick={updateToProcess}
              name="update-proccessed"
            >
              Processed
            </UpdateButton>
          )}
          {status === 2 && (
            <UpdateButton
              type="button"
              icon={<TbTruckDelivery className="h-full w-full" />}
              wmax
              deliver
              name="update-proccessed"
              onClick={updateToDeliver}
            >
              On Delivery
            </UpdateButton>
          )}
          {status === 3 && (
            <UpdateButton
              type="button"
              icon={<LiaSubwaySolid className="h-full w-full" />}
              wmax
              disabled
              name="onitsway"
            >
              {`On it's way`}
            </UpdateButton>
          )}
          {status === 4 && (
            <UpdateButton
              type="button"
              icon={<FaBox className="h-full w-full" />}
              wmax
              disabled
              name="delivered"
            >
              Delivered
            </UpdateButton>
          )}
          {status === 5 && (
            <UpdateButton
              type="button"
              icon={<FaCheckCircle className="h-full w-full" />}
              wmax
              disabled
              name="completed"
            >
              Completed
            </UpdateButton>
          )}
        </div>
        <div>
          <p>Shipping Status</p>
          <p className=" font-medium">{orderDetail.status}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border-[1px] border-primary p-3">
        <p>Deliver to</p>
        <p className="text-center">{orderDetail.address}</p>
      </div>
      <div className="mt-3 flex justify-evenly rounded-lg border-[1px] border-primary p-3">
        <div>
          <p>Initial Price</p>
          <p>{formatIDR(orderDetail.initial_price)}</p>
        </div>
        <div>
          <p>Final Price</p>
          <p>{formatIDR(orderDetail.final_price)}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border-[1px] border-primary p-3">
        {orderDetail.product.map((item) => (
          <div key={item.product_id} className="flex items-center">
            <ImageWithFallback
              alt={`${item.product_id}`}
              key={`img${item.product_id}`}
              className="min-h-[5rem] min-w-[5rem] object-cover p-2"
              src={item.photo}
              height={100}
              width={100}
              loading="lazy"
            />
            <div>
              <p className=" line-clamp-1">{item.product_name}</p>
              <p className=" line-clamp-1">{formatIDR(item.product_price)}</p>
              <p className=" line-clamp-1">x{item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetail;
