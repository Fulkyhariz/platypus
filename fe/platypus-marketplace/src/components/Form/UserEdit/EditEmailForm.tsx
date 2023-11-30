/*eslint no-unused-vars: "off"*/
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
import { useUser } from "@/store/user/useUser";
import service from "@/services/services";
import { useToast } from "@/components/ui/use-toast";
import { useModal } from "@/store/modal/useModal";
import ButtonWithLoading from "@/components/Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";

const FormSchema = z.object({
  email: z.string().min(1),
});

const EditEmailForm = () => {
  const userData = useUser.use.userData();
  const { hideModal } = useModal.getState();
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();

  const { getUserData } = useUser.getState();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: userData?.email,
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();
    const { error, data, code, message } =
      await service.patchUserEmail(submitData);

    if (error) {
      hideLoadingSm();
      toast({
        title: message,
        variant: "destructive",
      });
    }
    if (!error && code === 200) {
      hideLoadingSm();
      toast({
        title: "Change email successful",
        variant: "success",
      });
      getUserData();
      hideModal();
    }
  }

  return (
    <div
      id="edit-email"
      className="max-h-[90vh] w-[80vw] overflow-y-scroll rounded-lg border-border p-5 shadow-drop-line md:w-[50vh]"
    >
      <h2 className="mb-5 text-center text-xl font-bold text-primary">
        Edit Your Email
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@platypus.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-5">
            <ButtonWithLoading
              loadingContent="Please Wait"
              className="w-full"
              type="submit"
            >
              Save
            </ButtonWithLoading>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditEmailForm;
