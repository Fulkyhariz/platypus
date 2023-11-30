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
import service from "@/services/services";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

interface IChangePinConfirmPasswordForm {
  setVerifiedToken: React.Dispatch<React.SetStateAction<string>>;
}
const ChangePinConfirmPasswordForm = ({
  setVerifiedToken,
}: IChangePinConfirmPasswordForm) => {
  const { toast } = useToast();
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();
    const { error, data, code } = await service.postVerifyChangePin(submitData);

    if (error && code === 500) {
      toast({ title: "Server error", variant: "destructive" });
      hideLoadingSm();
    } else if (error && code === 401) {
      hideLoadingSm();
      toast({ title: "Wrong Password", variant: "destructive" });
    } else {
      setVerifiedToken(data.data);
      hideLoadingSm();
      toast({ title: "Set your new wallet pin", variant: "success" });
    }
  }

  return (
    <div id="edit-first-name" className="md:w-[50vh]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-5">
            <ButtonWithLoading
              type="submit"
              buttonContent="Confirm"
              loadingContent="Please Wait..."
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePinConfirmPasswordForm;
