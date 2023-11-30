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
import { useRouter } from "next/router";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  new_password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password must not exceed 128 characters" })
    .refine((value) => /[A-Z]/.test(value), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((value) => /[0-9]/.test(value), {
      message: "Password must contain at least one number",
    })
    .refine((value) => /[!@#$%^&*)(+=._-]/.test(value), {
      message: "Password must contain at least one special character",
    }),
});

interface INewResetPasswordForm {
  changeCode: string;
}

const NewResetPasswordForm = ({ changeCode }: INewResetPasswordForm) => {
  const { toast } = useToast();

  const router = useRouter();
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      new_password: "",
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();
    const { error } = await service.patchResetPassword(submitData, changeCode);

    if (error) {
      hideLoadingSm();
      toast({ title: "Failed to reset password", variant: "destructive" });
    } else {
      hideLoadingSm();
      toast({
        title: "Success Reset Password",
        description: "Redirecting...",
        variant: "success",
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  return (
    <div id="edit-first-name" className="md:w-[50vh]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Reset Password</FormLabel>
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
              buttonContent="Reset Password"
              loadingContent="Please Wait"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewResetPasswordForm;
