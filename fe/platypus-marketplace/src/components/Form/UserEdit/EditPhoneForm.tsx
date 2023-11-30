/*eslint no-unused-vars: "off"*/

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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

const FormSchema = z.object({
  phone_number: z.string().regex(/^[1-9]/),
});

const EditPhoneForm = () => {
  const userData = useUser.use.userData();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      phone_number: userData?.phone_number,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {}

  return (
    <div
      id="edit-phone"
      className="max-h-[90vh] w-[80vw] overflow-y-scroll rounded-lg border-border p-5 shadow-drop-line md:w-[50vh]"
    >
      <h2 className="mb-5 text-center text-xl font-bold text-primary">
        Edit Your Phone Number
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    placeholder="821xxxxxx"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-5">
            <Button className="w-full" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditPhoneForm;
