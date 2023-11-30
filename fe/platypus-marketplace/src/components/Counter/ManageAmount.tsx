import { useAmount } from "@/store/amount/useAmount";
import React, { useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";

interface IManageAmount extends React.HTMLAttributes<HTMLDivElement> {
  maxIncrease?: number;
}

const ManageAmount = ({ className, maxIncrease, ...props }: IManageAmount) => {
  const itemAmount = useAmount.use.itemAmount();
  const productDetail = useProdDetail.use.productDetail();
  const { plusItemAmount, minusItemAmount, setItemAmount } =
    useAmount.getState();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setItemAmount(value, maxIncrease);
  };

  useEffect(() => {
    setItemAmount(1);
  }, [productDetail]);

  return (
    <div className={cn(className)} {...props}>
      <div className="relative">
        <Input
          onKeyDown={(evt) =>
            ["e", "E", "+", "-", "."].includes(evt.key) && evt.preventDefault()
          }
          type="number"
          onChange={(e) => handleAmountChange(e)}
          value={itemAmount}
          className="px-5 text-center"
        />
        <button
          disabled={itemAmount <= 1 || isNaN(itemAmount)}
          onClick={minusItemAmount}
          className=" absolute left-0 top-0 h-full px-3 transition-colors hover:text-primary hover:transition-colors disabled:text-slate-300"
        >
          <FaMinus />
        </button>
        <button
          disabled={
            maxIncrease ? itemAmount >= maxIncrease || isNaN(itemAmount) : false
          }
          onClick={plusItemAmount}
          className=" absolute right-0 top-0 h-full px-3 transition-colors hover:text-primary hover:transition-colors disabled:text-slate-300"
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};

export default ManageAmount;
