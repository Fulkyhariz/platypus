import React from "react";
import styles from "./MyOrderContainer.module.scss";
import { useMyOrder } from "@/store/myOrder/useMyOrder";
import MyOrderRow from "@/components/Table/MyOrderRow";

interface IMyOrderContainer {
  page: number;
}

const MyOrderContainer = ({ page }: IMyOrderContainer) => {
  const { myOrderList } = useMyOrder();

  if (!myOrderList) {
    return null;
  }

  return (
    <div id="new-product-form" className="mb-5 mt-10 max-lg:mt-40">
      <h2 className="mb-5 text-4xl font-bold text-primary">Manage Orders</h2>
      <div className="w-full overflow-scroll rounded-lg bg-background p-5 shadow-md">
        <table className="w-full min-w-[60rem] shrink-0 table-fixed overflow-x-scroll text-left text-sm">
          <thead>
            <tr className=" border-b-[1px] border-primary">
              <th className={`${styles.clamp} w-[10%] p-2`}>Username</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Initial Price</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Final Price</th>
              <th className={`${styles.clamp} w-[15%] p-2`}>Address</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Courier</th>
              <th className={`${styles.clamp} w-[25%] p-2`}>Products</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>ETA</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {myOrderList.map((order) => (
              <MyOrderRow
                key={order.order_detail_id}
                order={order}
                page={page}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrderContainer;
