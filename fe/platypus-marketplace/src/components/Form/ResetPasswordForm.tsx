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
import { useToast } from "../ui/use-toast";

const FormSchema = z.object({
  email: z.string().min(1),
});

const ResetPasswordForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();

    const { error, message, code } =
      await service.postLinkToResetPassword(submitData);

    if (error) {
      if (code === 403) {
        toast({ title: "Email not found", variant: "destructive" });
      }
      console.error(message);
      hideLoadingSm();
    } else {
      toast({
        title: "Email has been sent, check your email",
        description: "Redirecting...",
        variant: "success",
      });
      hideLoadingSm();
      setTimeout(() => {
        router.push(`/login`);
      }, 2000);
    }
  }

  return (
    <div id="edit-first-name" className="md:w-[50vh]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} className="text-center" />
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

export default ResetPasswordForm;
