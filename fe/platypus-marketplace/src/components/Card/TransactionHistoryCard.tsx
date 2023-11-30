import React from "react";
import { IoStorefrontOutline } from "react-icons/io5";
import { BiPurchaseTag } from "react-icons/bi";
import { CiCalendar } from "react-icons/ci";
import { PiReceiptLight } from "react-icons/pi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/utils/formatIDR";
import Image from "next/image";
import { useModal } from "@/store/modal/useModal";
import { IUserTransaction } from "@/interfaces/transactionHistory";
import { formatDate } from "@/utils/formatDate";
import { ModalReview } from "../Modal/ModalReview";
import service from "@/services/services";
import { toast } from "../ui/use-toast";
import { useUser } from "@/store/user/useUser";

const TransactionsHistoryCard: React.FC<IUserTransaction> = (
  props: IUserTransaction,
) => {
  const { showModal, hideModal } = useModal.getState();
  const { getUserTransaction } = useUser.getState();

  const showDetailTransaction = () => {
    showModal(
      <div className="max-h-[500px] overflow-y-scroll p-7">
        <div className="flex justify-between">
          <h1 className="mb-5 text-lg font-semibold">Transaction Details</h1>
          <p>Order number - {props.order_id}</p>
        </div>
        {props.merchant.map((merchant) => {
          return (
            <div className="mt-5" key={merchant.merchant_id}>
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <p>Order from merchant : {merchant.merchant_name}</p>
                  <p>Order detail ID : {merchant.order_detail_id}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p>
                    Estimated Arrival : {formatDate(merchant.estimated_time)}
                  </p>
                  <p>Delivery by {merchant.courier_id}</p>
                </div>
              </div>
              {merchant.product.map((product) => {
                return (
                  <div
                    className="mb-5 overflow-y-scroll"
                    key={product.product_id}
                  >
                    <div className="flex gap-5 py-3">
                      <Image
                        src={product.photo}
                        alt=""
                        height={100}
                        width={100}
                        className=" h-24 w-24 md:h-32 md:w-32"
                      />
                      <div className="flex max-w-[45rem] flex-1 flex-col justify-between">
                        <div>
                          <p className="">{product.product_name}</p>
                          <p>
                            {product.quantity} pcs x{" "}
                            {formatIDR(product.product_price)}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant={"outline"}>{merchant.status}</Badge>
                          <div className="flex gap-2">
                            {merchant.status == "Delivered" && (
                              <Button
                                onClick={() => {
                                  showCompleteOrder(merchant.order_detail_id);
                                }}
                              >
                                Complete Order
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                showGiveReview(
                                  product.product_id,
                                  merchant.order_detail_id,
                                  props.order_id,
                                );
                              }}
                              disabled={
                                product.is_reviewed ||
                                merchant.status !== "Completed"
                              }
                            >
                              {product.is_reviewed ? "Reviewed" : "Give review"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <p>Total amount : {formatIDR(merchant.final_price)}</p>
            </div>
          );
        })}
        <p className="mt-5 font-semibold">
          Total purchase : {formatIDR(props.order_price)}
        </p>
      </div>,
    );
  };

  const showGiveReview = (
    product_id: number,
    order_detail_id: number,
    order_id: number,
  ) => {
    showModal(
      <ModalReview
        product_id={product_id}
        order_detail_id={order_detail_id}
        order_id={order_id}
        transaction={props}
      />,
    );
  };

  const showCompleteOrder = (order_detail_id: number) => {
    showModal(
      <div className="p-10">
        <p>Are you sure to complete the order?</p>
        <div className="mt-5 flex gap-2">
          <Button
            onClick={() => {
              hideModal();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              const { error } =
                await service.putOrderCompleted(order_detail_id);
              if (error) {
                toast({
                  title: "Fail to complete order",
                  variant: "destructive",
                });
                hideModal();
              } else {
                toast({
                  title: `Order ${order_detail_id} successfully completed`,
                  variant: "success",
                });
                hideModal();
                getUserTransaction(1);
              }
            }}
          >
            Yes, complete order
          </Button>
        </div>
      </div>,
    );
  };

  return (
    <div className="flex w-[90%] min-w-[700px] flex-col gap-y-6 rounded-lg border-[1px] border-border bg-background p-5 shadow-sm">
      <div className="flex justify-between gap-10">
        <div className="flex items-center gap-1">
          <BiPurchaseTag />
          <p>Transaction Invoice {props.order_id}</p>
        </div>
        <div className="flex items-center gap-1">
          <CiCalendar />
          <p>{formatDate(props.merchant[0].estimated_time)}</p>
        </div>
        <Badge variant={"outline"}>{props.merchant[0].status}</Badge>
        <div className="flex items-center gap-1">
          <PiReceiptLight />
          <p>
            Order no. <strong>{props.order_id}</strong>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IoStorefrontOutline />
        <p>{props.merchant[0].merchant_name}</p>
      </div>
      <div className="flex">
        <div className="flex flex-1 gap-5">
          <div className="min-h-[8rem] min-w-[8rem]">
            <Image
              src={props.merchant[0].product[0].photo}
              alt=""
              height={128}
              width={128}
              objectFit="contain"
              className="h-24 w-24 md:h-32 md:w-32"
            ></Image>
          </div>
          <div>
            <p className="font-medium">
              {props.merchant[0].product[0].product_name}
            </p>
            <p className="text-sm">
              {props.merchant[0].product[0].quantity} pcs x{" "}
              {formatIDR(props.merchant[0].product[0].product_price)}
            </p>
            <p
              onClick={showDetailTransaction}
              className="mt-3 w-fit hover:cursor-pointer hover:font-medium"
            >
              See all products from {props.merchant.length} merchants
            </p>
          </div>
        </div>
        <div className="mr-10">
          <p>Total purchase : </p>
          <p className="text-xl font-bold">{formatIDR(props.order_price)}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-5">
        <p
          onClick={showDetailTransaction}
          className="text-primary hover:cursor-pointer hover:font-medium"
        >
          Show details
        </p>
      </div>
    </div>
  );
};

export default TransactionsHistoryCard;
