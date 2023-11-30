"use client";

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
import { Input } from "@/components/ui/input";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import service from "@/services/services";

const merchantRegisterFormSchema = z.object({
  merchant_name: z
    .string()
    .min(3, {
      message: "Merchant Name must be at least 3 characters.",
    })
    .refine((value) => /^[a-zA-Z0-9-_ ]+$/.test(value), {
      message:
        "Merchant Name can only contain letters, numbers, '-' and '_',. no space and special character allowed",
    }),
});

const MerchantRegisterForm = () => {
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof merchantRegisterFormSchema>>({
    resolver: zodResolver(merchantRegisterFormSchema),
    defaultValues: {
      merchant_name: "",
    },
  });

  async function onSubmit(
    submitData: z.infer<typeof merchantRegisterFormSchema>,
  ) {
    showLoadingSm();
    const { error } = await service.postRegisterUserMerchant(submitData);

    if (error) {
      toast({
        title: "Failed to register your merchant",
        variant: "destructive",
      });
      hideLoadingSm();
    } else {
      toast({
        title: "Merchant Registered",
        variant: "success",
      });
      hideLoadingSm();
      router.push("/merchant-center");
    }
  }

  return (
    <div className="mt-5 w-[80vw] rounded-lg border-border p-5 shadow-drop-line lg:mt-0 lg:flex lg:w-[30rem] lg:flex-col lg:justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="merchant_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Merchant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Merchant name" {...field} />
                </FormControl>
                <FormMessage className="font-thin" />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-5">
            <ButtonWithLoading
              buttonContent="Register Merchant"
              loadingContent="Registering merchant..."
              type="submit"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MerchantRegisterForm;
