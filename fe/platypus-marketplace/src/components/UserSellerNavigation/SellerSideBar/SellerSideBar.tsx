import React, { useEffect, useState } from "react";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";
import styles from "./SellerSideBar.module.scss";
import classNames from "classnames";
import { LuView } from "react-icons/lu";
import { IoClose, IoWalletOutline, IoLocationOutline } from "react-icons/io5";
import { LiaPlusCircleSolid } from "react-icons/lia";
import { GoPackageDependents } from "react-icons/go";
import { MdOutlineLocalShipping } from "react-icons/md";
import ListNavigation from "../ListNavigation/ListNavigation";
import { Button } from "../../ui/button";
import PlatypusHead from "../../SVG/PlatypusHead";
import { useUser } from "@/store/user/useUser";
import SellerSmallNavbar from "../SellerSmallNavbar/SellerSmallNavbar";
import service from "@/services/services";
import { BsBoxes } from "react-icons/bs";
import { TbDiscount2 } from "react-icons/tb";
import { BiSolidDiscount } from "react-icons/bi";
import { CiCircleList } from "react-icons/ci";

const SellerSideBar = () => {
  const [asideHide, setAsideHide] = useState(true);
  const router = useRouter();
  const { getUserData } = useUser.getState();

  useEffect(() => {
    getUserData();
  }, []);

  const handleAdminLogout = async () => {
    await service.postLogout();
    deleteCookie("accessToken", { path: "/" });
    deleteCookie("refreshToken", { path: "/" });
    router.push("/login");
  };

  const toggleAside = () => {
    setAsideHide(!asideHide);
  };

  const containerClasses = classNames(styles.asideContainer);
  const listWrapperClasses = classNames(styles.listWrapper);

  return (
    <>
      <SellerSmallNavbar toggleAside={toggleAside} />
      <div
        className={`${containerClasses} ${
          asideHide ? "-translate-x-[110%] lg:translate-x-0" : "translate-x-0"
        }`}
      >
        <div className="relative overflow-y-scroll pt-16" id="aside-navigation">
          <div className="fixed left-0 top-0 flex w-full items-center justify-between border-b-[1px] border-primary bg-background px-5 py-5">
            <div className="flex items-center gap-3">
              <PlatypusHead
                onClick={() => router.push("/merchant-center")}
                className=" lg:16 w-10 cursor-pointer"
              />
              <p className="font-bold text-primary lg:text-2xl">Platypus</p>
            </div>
            <div className="lg:hidden">
              <IoClose
                onClick={toggleAside}
                className=" cursor-pointer text-xl text-secondary-foreground transition-colors hover:text-primary hover:transition-colors"
              />
            </div>
          </div>
          <nav className="px-3">
            <ul className={listWrapperClasses}>
              <h2 className="mb-3 font-bold">Dashboard</h2>
              <ListNavigation
                name="Overview"
                to="/merchant-center"
                icon={<LuView />}
                isActive={router.pathname === "/merchant-center"}
              />
            </ul>
            <ul className={listWrapperClasses}>
              <h2 className="mb-3 font-bold">Income</h2>
              <ListNavigation
                name="Merchant's Wallet"
                to="/merchant-center/income"
                icon={<IoWalletOutline />}
                isActive={router.pathname === "/merchant-center/income"}
              />
            </ul>
            <ul className={listWrapperClasses}>
              <h2 className="mb-3 font-bold">Orders</h2>
              <ListNavigation
                name="Manage Orders"
                to="/merchant-center/manage-orders"
                icon={<GoPackageDependents />}
                isActive={router.pathname === "/merchant-center/manage-orders"}
              />
            </ul>
            <ul className={listWrapperClasses}>
              <h2 className="mb-3 font-bold">Product</h2>
              <ListNavigation
                name="Add Product"
                to="/merchant-center/add-product"
                icon={<LiaPlusCircleSolid />}
                isActive={router.pathname === "/merchant-center/add-product"}
              />
              <ListNavigation
                name="My Products"
                to="/merchant-center/my-products"
                icon={<BsBoxes />}
                isActive={router.pathname === "/merchant-center/my-products"}
              />
            </ul>
            <ul className={listWrapperClasses}>
              <h2 className="mb-3 font-bold">Promotion</h2>
              <ListNavigation
                name="Add Merchant Promotion"
                to="/merchant-center/add-promotion"
                icon={<TbDiscount2 />}
                isActive={router.pathname === "/merchant-center/add-promotion"}
              />
              <ListNavigation
                name="Add Products Promotion"
                to="/merchant-center/add-promotion-products"
                icon={<BiSolidDiscount />}
                isActive={
                  router.pathname === "/merchant-center/add-promotion-products"
                }
              />
              <ListNavigation
                name="Promotion List"
                to="/merchant-center/promotion-list"
                icon={<CiCircleList />}
                isActive={router.pathname === "/merchant-center/promotion-list"}
              />
            </ul>
            <ul className={listWrapperClasses}>
              <h2 className="mb-3 font-bold">Manage Shipment</h2>
              <ListNavigation
                name="Address"
                to="/merchant-center/manage-address"
                icon={<IoLocationOutline />}
                isActive={router.pathname === "/merchant-center/manage-address"}
              />
              <ListNavigation
                name="Courier"
                to="/merchant-center/manage-courier"
                icon={<MdOutlineLocalShipping />}
                isActive={router.pathname === "/merchant-center/manage-courier"}
              />
            </ul>
          </nav>
        </div>
        <div className=" flex items-center justify-center rounded-lg bg-background p-5 shadow">
          <Button onClick={handleAdminLogout} name="logout-admin">
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default SellerSideBar;
