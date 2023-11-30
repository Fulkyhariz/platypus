/*eslint no-unused-vars: "off"*/
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { IoCalendarNumberOutline } from "react-icons/io5";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { InputPrimeIcon } from "../Input/InputPrimeIcon";
import { formatDateYMD } from "@/utils/formatDate";
import { useRouter } from "next/router";
import UniPagination from "../Pagination/UniPagination";
import { IUniPagination } from "@/interfaces/productReview";
import { IMyProductContainer } from "@/interfaces/product";
import ProductListPormotionContainer from "../Container/ProductListPormotionContainer/ProductListPormotionContainer";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";

type AddPromotionPayload = {
  voucher_code: string;
  promotion_scope: string;
  amount: string;
  promotion_type: string;
  start_date: string;
  end_date: string;
  quota: string;
  max_amount?: string;
  products?: number[];
  name: string;
};

const FormSchema = z
  .object({
    name: z
      .string({ required_error: "Please enter promotion title" })
      .min(10, { message: "Title must be at least 10 characters" }),
    voucher_code: z
      .string({ required_error: "Please enter voucher code" })
      .min(6, { message: "Title must be at least 6 characters" }),
    max_amount: z
      .string({ required_error: "Please enter maximum order quantity" })
      .min(0),
    quota: z
      .string({ required_error: "Please enter quota of promotion" })
      .regex(/^[1-9]/),
    amountCut: z
      .string({ required_error: "Please enter promotion amount" })
      .min(0),
    amountPercent: z
      .string({ required_error: "Please enter percentage for promotion" })
      .min(0)
      .refine((value) => parseInt(value) > 0 && parseInt(value) < 100, {
        message: "Maximal weight is 100.000",
      }),
    promotion_type: z
      .string({
        required_error: "Please select discount type",
      })
      .refine((data) => data !== "", {
        message: "Please select promotion type",
      }),
    promotion_scope: z.string().optional(),
    start_date: z.date({
      required_error: "Please choose the start date of voucher validation",
    }),
    end_date: z.date({
      required_error: "Please choose the end date of voucher validation",
    }),
  })
  .refine((data) => data.start_date < data.end_date, {
    message: "Start date can't exceed end date",
    path: ["start_date"],
  })
  .refine((data) => data.start_date < data.end_date, {
    message: "Start date can't exceed end date",
    path: ["end_date"],
  });

interface AddProductPromotionForm extends IUniPagination, IMyProductContainer {}

export function AddProductPromotionForm({
  onChangeSearch,
  onChangeFilter,
  onClickChangePage,
  onClickNextChangePage,
  onClickPrevChangePage,
  pageInformation,
}: AddProductPromotionForm) {
  const [promoType, setType] = useState("");
  const [choosenProduct, setChoosenProduct] = useState<number[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      voucher_code: "",
      amountCut: "",
      amountPercent: "",
      max_amount: "",
      promotion_type: "",
      quota: "",
      name: "",
    },
  });

  const onCheckProduct = (id: number, type: boolean) => {
    let updatedSelectedProduct = [...choosenProduct];
    if (type) {
      const isContain = updatedSelectedProduct.some((idProd) => idProd === id);
      if (!isContain) {
        setChoosenProduct([...(choosenProduct as number[]), id]);
      }
    } else {
      const removeProductList = choosenProduct.filter((value) => value !== id);
      setChoosenProduct([...removeProductList]);
    }
  };

  const onRemovePromo = (id: number) => {
    const removeProductList = choosenProduct.filter((value) => value !== id);
    setChoosenProduct([...removeProductList]);
  };

  async function onSubmit(dataa: z.infer<typeof FormSchema>) {
    const percent = parseInt(dataa.amountPercent) / 100;

    if (dataa.promotion_type === "CUT") {
      const payload: AddPromotionPayload = {
        voucher_code: dataa.voucher_code,
        promotion_scope: "PRODUCT",
        amount:
          dataa.promotion_type === "CUT" ? dataa.amountCut : percent.toString(),
        promotion_type: dataa.promotion_type,
        start_date: formatDateYMD(dataa.start_date.toString()),
        end_date: formatDateYMD(dataa.end_date.toString()),
        quota: dataa.quota,
        name: dataa.name,
        products: choosenProduct,
      };
      const { error, data } = await service.postNewPromotion(payload);

      if (error) {
        toast({ title: "Fail to add product", variant: "destructive" });
      } else {
        toast({ title: data.message, variant: "success" });
        router.reload();
      }
    }

    if (dataa.promotion_type === "DISC") {
      const payload: AddPromotionPayload = {
        voucher_code: dataa.voucher_code,
        promotion_scope: "PRODUCT",
        amount: percent.toString(),
        promotion_type: dataa.promotion_type,
        start_date: formatDateYMD(dataa.start_date.toString()),
        end_date: formatDateYMD(dataa.end_date.toString()),
        quota: dataa.quota,
        max_amount:
          dataa.promotion_type === "DISC" ? dataa.max_amount : undefined,
        name: dataa.name,
        products: choosenProduct,
      };
      const { error, data } = await service.postNewPromotion(payload);

      if (error) {
        toast({ title: "Fail to add product", variant: "destructive" });
      } else {
        toast({ title: data.message, variant: "success" });
        router.reload();
      }
    }
  }

  const handleRadioChange = (e: any) => {
    setType(e.target.value);
  };

  return (
    <>
      <div id="new-promotion-product-form" className="mb-5 mt-10 max-lg:mt-40">
        <h2 className="mb-5 text-xl font-bold text-primary md:text-4xl">
          Add New Product Promotion
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <div className="mt-15 mb-5 max-h-[90vh] w-full rounded-lg border-[1px] border-border bg-background p-5 shadow-md md:w-full md:p-10">
              <h2 className="pb-2 font-bold  text-primary md:pb-5 md:text-lg">
                General Informations
              </h2>
              <div className="w-fit rounded-lg border-[1px] border-primary p-3">
                <p className="text-sm font-medium text-primary">
                  Chosen Product Id
                </p>
                {choosenProduct.length === 0 && (
                  <Badge className=" bg-destructive">Empty</Badge>
                )}
                <div className="space-x-1">
                  {choosenProduct.map((chosen) => (
                    <Badge
                      key={chosen}
                      onClick={() => onRemovePromo(chosen)}
                      className="cursor-pointer"
                    >
                      {chosen}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-28">
                <FormField
                  control={form.control}
                  name="promotion_type"
                  render={({ field }) => (
                    <FormItem className="mt-5 space-y-3">
                      <div className="mb-4">
                        <FormLabel className="text-sm">
                          Type of discount
                        </FormLabel>
                        <FormDescription>Select a type.</FormDescription>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue("amountPercent", "1");
                          }}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="DISC"
                                onClick={handleRadioChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Percentage
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value="CUT"
                                onClick={handleRadioChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Cut price
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  {promoType == "CUT" && (
                    <FormField
                      control={form.control}
                      name="amountCut"
                      render={({ field }) => (
                        <FormItem className="mt-5">
                          <FormLabel>Discount amount</FormLabel>
                          <FormControl>
                            <InputPrimeIcon
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-", "."].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              type="number"
                              placeholder="Amount"
                              icon="Rp"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {promoType == "DISC" && (
                    <div>
                      <FormField
                        control={form.control}
                        name="amountPercent"
                        render={({ field }) => (
                          <FormItem className="mt-5">
                            <FormLabel>Discount amount</FormLabel>
                            <FormControl>
                              <InputPrimeIcon
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-", "."].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                type="number"
                                placeholder="Amount"
                                icon="%"
                                className="w-full"
                                {...field}
                                iconEnd
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="max_amount"
                        render={({ field }) => (
                          <FormItem className="mt-5">
                            <FormLabel>Maximum amount</FormLabel>
                            <FormControl>
                              <InputPrimeIcon
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-", "."].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                type="number"
                                placeholder="Max. amount"
                                icon="Rp"
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-28 ">
                <FormField
                  control={form.control}
                  name="promotion_scope"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Promotion Scope</FormLabel>
                      <FormControl>
                        <InputPrimeIcon
                          type="string"
                          placeholder="PRODUCT"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="voucher_code"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <InputPrimeIcon
                          type="string"
                          placeholder="Code"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-28 ">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Promotion Title</FormLabel>
                      <FormControl>
                        <InputPrimeIcon
                          type="string"
                          placeholder="Title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quota"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Quota</FormLabel>
                      <FormControl>
                        <InputPrimeIcon
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-", "."].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          type="number"
                          placeholder="Quota"
                          icon="x"
                          className="w-full"
                          iconEnd
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <h2 className="py-2 font-bold text-primary md:py-5 md:pt-28 md:text-lg">
                Validation Date
              </h2>
              <div className="md:grid md:grid-cols-2 md:gap-28 ">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="mt-5 flex flex-col">
                      <FormLabel>Start date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick start date</span>
                              )}
                              <IoCalendarNumberOutline />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            fromYear={1960}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        This date is the starting date of the promotion to be
                        valid
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="mt-5 flex flex-col">
                      <FormLabel>End date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick start date</span>
                              )}
                              <IoCalendarNumberOutline />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            fromYear={1960}
                            toYear={2030}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        This date is the due date of the promotion to be valid
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <ButtonWithLoading
              disabled={choosenProduct.length === 0}
              className="w-full"
              type="submit"
              name="submit-add-promotion"
              buttonContent={`${
                choosenProduct.length === 0
                  ? "Select product first"
                  : "Create and Apply"
              } `}
              loadingContent="Adding Promotion..."
            />
          </form>
        </Form>
      </div>
      <ProductListPormotionContainer
        onCheckProduct={onCheckProduct}
        onChangeSearch={onChangeSearch}
        onChangeFilter={onChangeFilter}
        choosenProduct={choosenProduct}
      />
      <div className="mb-10 flex justify-center">
        <UniPagination
          onClickChangePage={onClickChangePage}
          onClickNextChangePage={onClickNextChangePage}
          onClickPrevChangePage={onClickPrevChangePage}
          pageInformation={pageInformation}
        />
      </div>
    </>
  );
}
