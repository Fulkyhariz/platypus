import useDebounce from "@/hooks/useDebounce";
import { useUser } from "@/store/user/useUser";
import { useWallet } from "@/store/wallet/useWallet";
import React, { useEffect, useState } from "react";
import UniPagination from "../Pagination/UniPagination";
import MyWalletHistoryContainer from "../Container/MyWalletHistoryContainer/MyWalletHistoryContainer";

const WalletHistory = () => {
  const userData = useUser.use.userData();
  const { pageInformation, getWalletHistory } = useWallet();
  const [tableManagement, setTableManagement] = useState<{
    page: number;
  }>({
    page: 1,
  });

  const onClickChangePage = (key: string, value: number) => {
    setTableManagement({
      ...tableManagement,
      [key]: value,
    });
  };

  const onClickNextChangePage = (key: string) => {
    setTableManagement({
      ...tableManagement,
      [key]: tableManagement.page + 1,
    });
  };

  const onClickPrevChangePage = (key: string) => {
    setTableManagement({
      ...tableManagement,
      [key]: tableManagement.page - 1,
    });
  };

  const debounchedFilter = useDebounce(tableManagement);

  useEffect(() => {
    if (userData) {
      getWalletHistory(debounchedFilter.page);
    }
  }, [userData, debounchedFilter]);

  if (!pageInformation) {
    return null;
  }

  return (
    <div className="flex max-h-[80vh] w-full flex-col items-center justify-center overflow-y-scroll p-3 lg:w-[30rem]">
      {/* {" "} */}
      <MyWalletHistoryContainer />
      <div className="flex">
        <UniPagination
          onClickChangePage={onClickChangePage}
          onClickNextChangePage={onClickNextChangePage}
          onClickPrevChangePage={onClickPrevChangePage}
          pageInformation={pageInformation}
        />
      </div>
    </div>
  );
};

export default WalletHistory;
