import { useUser } from "@/store/user/useUser";
import { formatIDR } from "@/utils/formatIDR";
import React from "react";
import { IoWallet } from "react-icons/io5";
import { Skeleton } from "../ui/skeleton";
import PopOutButton from "../Button/PopOutButton";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import { RiLockPasswordFill } from "react-icons/ri";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { useModal } from "@/store/modal/useModal";
import WalletHistory from "./WalletHistory";

const FormSchema = z.object({
  balance: z
    .string()
    .regex(/^[1-9]/)
    .refine((value) => parseInt(value) >= 10000, {
      message: "Minimum topup is Rp 10,000",
    })
    .refine((value) => parseInt(value) <= 2000000, {
      message: "Maximum topup is Rp 2,000,000",
    }),
});

const WalletInfo = () => {
  const walletData = useUser.use.walletData();
  const { getWalletData } = useUser.getState();
  const { toast } = useToast();
  const instantTopAmount = [10000, 50000, 100000, 300000, 500000, 1000000];
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();
  const { showModal } = useModal.getState();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      balance: "",
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();
    const { error } = await service.postTopUpPlatyPay({
      amount: parseInt(submitData.balance),
    });

    if (error) {
      hideLoadingSm();
      toast({
        title: "Failed to top up",
        variant: "destructive",
      });
    } else {
      hideLoadingSm();
      toast({
        title: `Congrats Platy!, your top up success! ${formatIDR(
          submitData.balance,
        )}`,
        variant: "success",
      });
      getWalletData();
    }
  }

  const onShowWalletHistory = () => {
    showModal(<WalletHistory />);
  };

  if (!walletData) {
    return <Skeleton className="mt-5 h-56 w-80" />;
  }
  return (
    <section className="flex flex-col items-center justify-center gap-5">
      <div className="relative flex h-48 w-80 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-pink-500 shadow-md md:h-56 md:w-96">
        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary">
          <IoWallet className="h-5 w-5" />
        </div>
        <div
          onClick={onShowWalletHistory}
          className="absolute right-3 top-14 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-primary transition-colors hover:bg-primary hover:text-background hover:transition-colors"
        >
          <FaHistory className="h-5 w-5" />
        </div>
        <Link
          href={"/change-pin-platypay"}
          className="group absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white text-primary transition-width duration-500 hover:w-20"
        >
          <RiLockPasswordFill className="h-5 w-5 translate-x-0 transition-transform duration-300 group-hover:-translate-x-[300%] group-hover:transition-transform group-hover:duration-500" />
          <p className="absolute translate-x-full transition-transform duration-500 group-hover:-translate-x-0 group-hover:transition-transform group-hover:duration-500 ">
            Change
          </p>
        </Link>
        <h2 className="text-4xl font-bold text-white">PlatyPay</h2>
        <p className="absolute bottom-5 left-5 text-white">
          Balance: {formatIDR(walletData.balance)}
        </p>
      </div>
      <div className="flex justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-1"
          >
            <div className="grid grid-cols-3 grid-rows-2 gap-3 rounded-lg border-2 border-border p-5 text-xs shadow-md md:text-sm lg:text-base">
              {instantTopAmount.map((balance) => (
                <FormField
                  key={balance}
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <PopOutButton
                      onClick={() => field.onChange(String(balance))}
                    >
                      {formatIDR(balance)}
                    </PopOutButton>
                  )}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="mt-1 flex-1">
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <FormLabel className="font-base">Balance</FormLabel>
                        <FormMessage />
                      </div>

                      <FormControl>
                        <Input
                          className="text-center"
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-", "."].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          type="number"
                          placeholder="Rupiah"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex-1 self-end ">
                <ButtonWithLoading
                  buttonContent="Top Up"
                  loadingContent="Please Wait..."
                  className="w-full"
                  type="submit"
                ></ButtonWithLoading>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default WalletInfo;
