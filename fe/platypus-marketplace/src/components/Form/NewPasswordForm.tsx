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
import { deleteCookie } from "cookies-next";
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

interface INewPasswordForm {
  changeCode: string;
}

const NewPasswordForm = ({ changeCode }: INewPasswordForm) => {
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
    const { error, message, code } = await service.patchChangePassword(
      submitData,
      changeCode,
    );

    if (error && code >= 500) {
      hideLoadingSm();
      toast({
        title: "Server error",
        variant: "destructive",
      });
    } else if (error && code === 400) {
      hideLoadingSm();
      toast({
        title: message,
        variant: "destructive",
      });
    } else {
      const { error } = await service.postLogout();

      if (error) {
        hideLoadingSm();
      } else {
        hideLoadingSm();
        deleteCookie("accessToken", { path: "/" });
        deleteCookie("refreshToken", { path: "/" });
        router.push("/login");
      }
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
                <FormLabel className="font-base">New Password</FormLabel>
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
              buttonContent="Change Password"
              loadingContent="Please Wait"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewPasswordForm;
