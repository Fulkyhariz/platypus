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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { useRajaOngkir } from "@/store/rajaongkir/useRajaongkir";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { IEditAddressPayload } from "@/interfaces/addresss";
import service from "@/services/services";
import { useUser } from "@/store/user/useUser";
import { useLoading } from "@/store/loading/useLoading";
import { useToast } from "../ui/use-toast";
import { useModal } from "@/store/modal/useModal";
import ButtonWithLoading from "../Button/ButtonWithLoading";

const FormSchema = z.object({
  name: z.string().min(1),
  province: z.string({
    required_error: "Please select province",
  }),
  city: z.string({
    required_error: "Please select city",
  }),
  sub_district: z.string().min(1),
  sub_sub_district: z.string().min(1),
  zip_code: z.string().min(1),
  phone_number: z.string().min(1),
  details: z
    .string()
    .min(10, {
      message: "Address details must be at least 10 characters.",
    })
    .max(160, {
      message: "Address details must not be longer than 160 characters.",
    }),
});

export function EditDetailAddressForm() {
  const { getProvince, getCities } = useRajaOngkir.getState();
  const selectedAddress = useUser.use.selectedAddress();
  const [triggerProv, setTriggerProv] = useState<string>();
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();
  const { getUserAddresses } = useUser.getState();
  const { toast } = useToast();
  const { hideModal } = useModal.getState();

  const onchangeTrigger = (value: string) => {
    setTriggerProv(value);
  };
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: selectedAddress?.name,
      province: `${selectedAddress?.province_code}&${selectedAddress?.province}`,
      city: `${selectedAddress?.district_code}&${selectedAddress?.district}`,
      sub_district: selectedAddress?.sub_district,
      sub_sub_district: selectedAddress?.sub_sub_district,
      zip_code: String(selectedAddress?.zip_code),
      phone_number: selectedAddress?.phone_number.slice(3),
      details: selectedAddress?.details,
    },
  });

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();
    const provinceData = submitData.province.split("&");
    const cityData = submitData.city.split("&");
    const payload: IEditAddressPayload = {
      id: selectedAddress?.id as number,
      name: submitData.name,
      province: provinceData[1],
      province_code: parseInt(provinceData[0]),
      district: cityData[1],
      district_code: parseInt(cityData[0]),
      sub_district: submitData.sub_district,
      sub_sub_district: submitData.sub_sub_district,
      zip_code: parseInt(submitData.zip_code),
      phone_number: `+62${submitData.phone_number}`,
      details: submitData.details,
    };
    const { error } = await service.putEditAddress(payload);

    if (error) {
      toast({
        title: "Failed to edit address",
        variant: "destructive",
      });
      hideLoadingSm();
    } else {
      toast({
        title: "Success add new address",
        variant: "success",
      });
      hideLoadingSm();
      hideModal();
      getUserAddresses();
    }
  }

  const provinces = useRajaOngkir.use.provinces();
  const cities = useRajaOngkir.use.cities();

  useEffect(() => {
    if (!provinces) {
      getProvince();
    }
    if (form.getValues("province")) {
      const provinceData = form.getValues("province").split("&");
      getCities(provinceData[0]);
    }
  }, [triggerProv]);

  return (
    <div
      id="new-address-form"
      className="max-h-[90vh] w-[80vw] overflow-y-scroll rounded-lg border-border p-5 shadow-drop-line md:w-[50vh]"
    >
      <h2 className="mb-5 text-center text-xl font-bold text-primary">
        Edit Your Address
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    onchangeTrigger(e);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className=" z-[110] max-h-[12rem] overflow-y-scroll">
                    {provinces ? (
                      provinces.map((province) => (
                        <SelectItem
                          key={province.province_id}
                          value={`${province.province_id}&${province.province}`}
                        >
                          {province.province}
                        </SelectItem>
                      ))
                    ) : (
                      <span className="loading loading-dots loading-lg text-primary"></span>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City{" "}
                  {form.getValues("province") === undefined && (
                    <span className="text-xs text-destructive">
                      Select province first
                    </span>
                  )}
                </FormLabel>
                <Select
                  disabled={
                    (form.getValues("province") && cities === undefined) ===
                    undefined
                  }
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[110] max-h-[12rem] overflow-y-scroll">
                    {cities ? (
                      cities.map((city) => (
                        <SelectItem
                          key={city.city_id}
                          value={`${city.city_id}&${city.city_name}`}
                        >
                          {city.city_name}
                        </SelectItem>
                      ))
                    ) : (
                      <span className="loading loading-dots loading-lg text-primary"></span>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sub_district"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Sub District</FormLabel>
                <FormControl>
                  <Input placeholder="Sub district" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sub_sub_district"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Sub of Sub District</FormLabel>
                <FormControl>
                  <Input placeholder="Sub of sub district" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Zip Code</FormLabel>
                <FormControl>
                  <Input
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", "."].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    placeholder="Zip Code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    placeholder="Phone Number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-base">Address Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your address details"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center pt-5">
            <ButtonWithLoading
              buttonContent="Edit Address"
              loadingContent="Editing your address.."
              className="w-full"
              type="submit"
            ></ButtonWithLoading>
          </div>
        </form>
      </Form>
    </div>
  );
}
