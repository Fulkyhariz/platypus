import MyOrderContainer from "@/components/Container/MyOrderContainer/MyOrderContainer";
import UserSellerLayout from "@/components/Layout/UserSellerLayout";
import Modal from "@/components/Modal/Modal";
import UniPagination from "@/components/Pagination/UniPagination";
import useDebounce from "@/hooks/useDebounce";
import { useMyOrder } from "@/store/myOrder/useMyOrder";
import { useUser } from "@/store/user/useUser";
import Head from "next/head";
import React, { ReactElement, useEffect, useState } from "react";

const ManageOrders = () => {
  const userData = useUser.use.userData();
  const { pageInformation, getOrderList } = useMyOrder();
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
      getOrderList(debounchedFilter.page);
    }
  }, [userData, debounchedFilter]);

  if (!pageInformation) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Manage Orders | Seller Platypus</title>
        <meta name="platypus" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/vm4/favicon.ico" />
      </Head>
      <main className="min-w-screen flex min-h-screen flex-col px-3 lg:ml-[20vw] lg:px-32">
        <Modal backDropClose />
        <MyOrderContainer page={tableManagement.page} />
        <div className="mb-10 flex justify-center">
          <UniPagination
            onClickChangePage={onClickChangePage}
            onClickNextChangePage={onClickNextChangePage}
            onClickPrevChangePage={onClickPrevChangePage}
            pageInformation={pageInformation}
          />
        </div>
      </main>
    </>
  );
};

ManageOrders.getLayout = function getLayout(page: ReactElement) {
  return <UserSellerLayout>{page}</UserSellerLayout>;
};

export default ManageOrders;
