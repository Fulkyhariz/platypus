import React from "react";
import styles from "./MyWalletHistoryContainer.module.scss";
import { useWallet } from "@/store/wallet/useWallet";
import { formatIDR } from "@/utils/formatIDR";

const MyWalletHistoryContainer = () => {
  const { myWalletHistory } = useWallet();

  if (!myWalletHistory) {
    return null;
  }

  return (
    <div id="new-product-form" className="mb-5">
      <h2 className="mb-5 text-center text-lg font-bold text-primary">
        Platypay History
      </h2>
      <div className="w-full overflow-scroll rounded-lg bg-background shadow-md">
        <table className="w-full shrink-0 table-fixed overflow-x-scroll text-left text-sm">
          <thead>
            <tr className=" border-b-[1px] border-primary">
              <th className={`${styles.clamp} w-[50%] p-2 text-center`}>
                Amount
              </th>
              <th className={`${styles.clamp} w-[50%] p-2 text-center`}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {myWalletHistory.map((hist) => (
              <tr
                key={hist.id}
                className="border-b-[1px] border-primary hover:bg-primary/10 "
              >
                <td className="px-2 py-4">
                  <p
                    className={`${
                      parseInt(hist.amount) < 0
                        ? "text-red-500"
                        : "text-primary"
                    } line-clamp-1`}
                  >
                    {formatIDR(hist.amount)}
                  </p>
                </td>
                <td className="px-2 py-4">
                  <p className="line-clamp-1">{hist.description}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyWalletHistoryContainer;
