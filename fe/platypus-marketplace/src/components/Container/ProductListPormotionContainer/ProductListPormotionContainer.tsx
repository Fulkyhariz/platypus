/*eslint no-unused-vars: "off"*/

import React, { useState } from "react";
import styles from "./ProductListPormotionContainer.module.scss";
import { useMyList } from "@/store/myList/useMyList";
import { Input } from "@/components/ui/input";
import { IoSearchOutline } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMyProductContainer } from "@/interfaces/product";
import ProductListPromotionRow from "@/components/Table/ProductListPromotionRow";

interface IProductListPormotionContainer extends IMyProductContainer {
  onCheckProduct: (id: number, type: boolean) => void;
  choosenProduct: number[];
}

const ProductListPormotionContainer = ({
  onChangeSearch,
  onChangeFilter,
  onCheckProduct,
  choosenProduct,
}: IProductListPormotionContainer) => {
  const { myProdList } = useMyList();
  const [stockActive, setStockActive] = useState<boolean>(false);
  const [productActive, setProductActive] = useState<boolean>(false);
  const toggleStockActive = async () => {
    setStockActive((prev) => !prev);
    onChangeFilter("exclude_no_stock", !stockActive);
    onChangeFilter("page", 1);
  };
  const toggleProductActive = async () => {
    setProductActive((prev) => !prev);
    onChangeFilter("exclude_not_active", !productActive);
  };

  if (!myProdList) {
    return null;
  }

  return (
    <div id="new-product-form" className="mb-5 ">
      <div className="w-full overflow-scroll rounded-lg bg-background p-5 shadow-md">
        <div className="mb-5 flex items-end gap-5">
          <div className="flex-1 text-xs">
            <p>Search</p>
            <Input
              onChange={onChangeSearch}
              placeholder="Search by product name"
              icon={<IoSearchOutline />}
            />
          </div>
          <div className="flex flex-[1.5] items-center justify-between">
            <div className="text-xs">
              <p>Order</p>
              <Select onValueChange={(v) => onChangeFilter("sort", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Order By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs">
              <p>Sort</p>
              <Select onValueChange={(v) => onChangeFilter("sort_by", v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="total_sold">Total Sold</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="recommended">Recommended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-between text-xs">
              <p>Stock</p>
              <input
                onChange={toggleStockActive}
                type="checkbox"
                className="toggle toggle-success"
                checked={stockActive}
              />
            </div>
            <div className="text-xs">
              <p>Active</p>
              <input
                onChange={toggleProductActive}
                type="checkbox"
                className="toggle toggle-success"
                checked={productActive}
              />
            </div>
          </div>
        </div>
        <table className="w-full min-w-[60rem] shrink-0 table-fixed overflow-x-scroll text-left text-sm">
          <thead>
            <tr className=" border-b-[1px] border-primary">
              <th className={`${styles.clamp} w-[10%] p-2`}>Add Promo</th>
              <th className={`${styles.clamp} w-[40%] p-2`}>Product Name</th>
              <th className={`${styles.clamp} w-[15%] p-2`}>Price</th>
              <th className={`${styles.clamp} w-[15%] p-2`}>Total Stock</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Rating</th>
              <th className={`${styles.clamp} w-[10%] p-2`}>Product Id</th>
            </tr>
          </thead>
          <tbody>
            {myProdList.map((product) => (
              <ProductListPromotionRow
                choosenProduct={choosenProduct}
                onCheckProduct={onCheckProduct}
                key={product.id}
                product={product}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListPormotionContainer;
