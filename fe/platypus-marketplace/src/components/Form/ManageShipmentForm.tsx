/*eslint no-unused-vars: "off"*/
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import ButtonWithLoading from "../Button/ButtonWithLoading";

// type ManageShipmentPayload = {
//   courier_id: number;
// };

const courier_id = [
  {
    id: "jne",
    label: "JNE",
  },
  {
    id: "pos",
    label: "POS",
  },
  {
    id: "tiki",
    label: "Tiki",
  },
] as const;

const FormSchema = z.object({
  courier_id: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "Please select one or more active courier",
    }),
});

export function ManageShipmentForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      courier_id: ["jne", "pos", "tiki"],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {}

  return (
    <div id="new-promotion-form" className="mb-20 mt-10 max-lg:mt-40">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <div className="mb-5 mt-10 max-h-[90vh] w-full overflow-y-scroll rounded-lg border-[1px] border-border bg-background p-5 shadow-md md:w-full md:p-10">
            <h2 className="pb-2 font-bold  text-primary md:pb-5 md:text-lg">
              Select available courier services
            </h2>
            <FormField
              control={form.control}
              name="courier_id"
              render={() => (
                <FormItem className="mt-5 space-y-3">
                  <div className="mb-4">
                    <FormLabel className="text-sm">
                      Courier Selections
                    </FormLabel>
                    <FormDescription>
                      Select one or more courier service options.
                    </FormDescription>
                  </div>
                  {courier_id.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="courier_id"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <ButtonWithLoading
            className="w-full"
            type="submit"
            name="save-shipment-settings"
            buttonContent="Save"
            loadingContent="Saving settings..."
          />
        </form>
      </Form>
    </div>
  );
}
