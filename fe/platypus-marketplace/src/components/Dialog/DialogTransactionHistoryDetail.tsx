"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DialogGiveReview from "./DialogGiveReview";
import { useUser } from "@/store/user/useUser";
import { useEffect } from "react";

interface ITransactionDetail {
  order_id: number;
}

const DialogTransactionHistoryDetail: React.FC<ITransactionDetail> = ({
  order_id,
}: ITransactionDetail) => {
  const { getUserDetailTransaction } = useUser.getState();
  const detailTransaction = useUser.use.userDetailTransaction();
  useEffect(() => {
    getUserDetailTransaction(order_id);
  }, []);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Detail Transaction</DialogTitle>
        <DialogDescription>
          Order transaction no. {detailTransaction?.order_id}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Give review</Button>
          </DialogTrigger>
          <DialogGiveReview />
        </Dialog>
      </DialogFooter>
    </DialogContent>
  );
};

export default DialogTransactionHistoryDetail;
