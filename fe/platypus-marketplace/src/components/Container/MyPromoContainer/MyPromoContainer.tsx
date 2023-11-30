import React from "react";
import styles from "./MyPromoContainer.module.scss";
import { useMyPromo } from "@/store/myPromo/useMyPromo";
import MyPromoRow from "@/components/Table/MyPromoRow";

const MyPromoContainer = () => {
  const { myPromoList } = useMyPromo();

  if (!myPromoList) {
    return null;
  }

  return (
    <div id="new-product-form" className="mb-5 mt-10 max-lg:mt-40">
      <h2 className="mb-5 text-4xl font-bold text-primary">My Promo List</h2>
      <div className="w-full overflow-scroll rounded-lg bg-background p-5 shadow-md">
        <table className="w-full min-w-[60rem] shrink-0 table-fixed overflow-x-scroll text-left text-sm">
          <thead>
            <tr className=" border-b-[1px] border-primary">
              <th className={`${styles.clamp} w-[10%] p-2`}>Code</th>
              <th className={`${styles.clamp} w-[7%] p-2`}>Name</th>
              <th className={`${styles.clamp} w-[5%] p-2`}>Type</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Amount</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Max Amount</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Start Date</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>End Date</th>
              <th className={`${styles.clamp} w-[18%] p-2`}>Products</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Scope</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {myPromoList.map((promo) => (
              <MyPromoRow key={promo.id} promo={promo} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPromoContainer;
