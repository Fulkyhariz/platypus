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
import React from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import service from "@/services/services";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";

const FormSchema = z.object({
  code: z
    .string()
    .min(6, { message: "The code has 6 characters " })
    .max(6, { message: "The code has 6 characters " }),
});

const CodeVerificationForm = () => {
  const router = useRouter();
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();

    const { error, data } = await service.postVerifyOTPCode(submitData);

    if (error) {
      hideLoadingSm();
    } else {
      hideLoadingSm();
      router.push(`/new-password/${data.data}`);
    }
  }

  return (
    <div id="edit-first-name" className="md:w-[50vh]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Code</FormLabel>
                <FormControl>
                  <Input {...field} className="text-center" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-5">
            <ButtonWithLoading
              type="submit"
              buttonContent="Send"
              loadingContent="Please Wait"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CodeVerificationForm;
