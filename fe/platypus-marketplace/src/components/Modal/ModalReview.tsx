import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import service from "@/services/services";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiTwotoneStar } from "react-icons/ai";
import { Button } from "../ui/button";
import { IUserTransaction } from "@/interfaces/transactionHistory";
import { useToast } from "../ui/use-toast";
import { useModal } from "@/store/modal/useModal";
import { useUser } from "@/store/user/useUser";

interface IModalReview {
  product_id: number;
  order_detail_id: number;
  order_id: number;
  transaction: IUserTransaction;
}
export const ModalReview = ({
  product_id,
  order_detail_id,
  transaction,
}: IModalReview) => {
  const { toast } = useToast();
  const { hideModal } = useModal.getState();
  const { getUserTransaction } = useUser.getState();

  const FormSchema = z.object({
    comments: z
      .string({
        required_error: "Please write your review in min. 20 characters",
      })
      .min(20),
    rating: z.string({ required_error: "Please select a rating" }).min(1),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      comments: "",
      rating: "",
    },
  });

  type AddReviewPayload = {
    product_id: number;
    order_detail_id: number;
    comments: string;
    rating: number;
  };

  async function onSubmit(dataa: z.infer<typeof FormSchema>) {
    const payload: AddReviewPayload = {
      product_id: product_id,
      order_detail_id: order_detail_id,
      comments: dataa.comments,
      rating: parseInt(dataa.rating),
    };
    const { error } = await service.postNewReview(payload);

    if (error) {
      toast({ title: "Fail to add review", variant: "destructive" });
      hideModal();
    } else {
      toast({ title: "Success add review", variant: "success" });
      hideModal();
      getUserTransaction(1);
    }
  }

  const merchantFiltered = transaction.merchant.find(
    (merchant) => merchant.order_detail_id == order_detail_id,
  );
  const productFiltered = transaction.merchant
    .find((merchant) => merchant.order_detail_id == order_detail_id)
    ?.product.find((product) => product.product_id == product_id);

  return (
    <div className="p-7">
      <h1 className="text-lg font-semibold">Give Review and Rating</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6 md:w-[800px]"
        >
          <div className="mt-5">
            <p>
              Review for merchant name :{" "}
              {merchantFiltered && merchantFiltered.merchant_name}
            </p>
            {productFiltered && (
              <div className="flex gap-5 py-3">
                <Image
                  src={productFiltered.photo}
                  alt=""
                  height={100}
                  width={100}
                  className="h-24 w-24 md:h-32 md:w-32"
                />
                <p>Product name : {productFiltered.product_name}</p>
              </div>
            )}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write down your thoughts about this product"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center justify-between space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="5" />
                        </FormControl>
                        <FormLabel className="flex gap-2 font-normal">
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="4" />
                        </FormControl>
                        <FormLabel className="flex gap-2 font-normal">
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="3" />
                        </FormControl>
                        <FormLabel className="flex gap-2 font-normal">
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="2" />
                        </FormControl>
                        <FormLabel className="flex gap-2 font-normal">
                          <AiTwotoneStar className="w-3" />
                          <AiTwotoneStar className="w-3" />
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="flex gap-2 font-normal">
                          <AiTwotoneStar className="w-3" />
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};
