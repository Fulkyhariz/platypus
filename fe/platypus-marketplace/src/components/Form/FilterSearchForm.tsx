"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Input } from "@/components/ui/input";

import { SheetFooter } from "../ui/sheet";
import { useEffect, useState } from "react";
import { AiTwotoneStar } from "react-icons/ai";
import { useRouter } from "next/router";
import { useFilter } from "@/store/filter/useFilter";
import { useProducts } from "@/store/products/useProducts";

const rating = [
  {
    id: "5",
    label: "5",
  },
  {
    id: "4",
    label: "4 and above",
  },
  {
    id: "3",
    label: "3 and above",
  },
  {
    id: "2",
    label: "2 and above",
  },
  {
    id: "1",
    label: "1 and above",
  },
] as const;

interface ICity {
  city_id: string;
  city_name: string;
}

interface ICategory {
  id: string;
  name: string;
}

const FilterSearchFormSchema = z
  .object({
    location: z.array(z.string()).optional(),
    categoryId: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    minRating: z.string().optional(),
  })
  .refine(
    (data) =>
      data.minPrice == "" ||
      data.maxPrice == "" ||
      (data.minPrice && data.maxPrice && data.minPrice < data.maxPrice),
    {
      message: "Min price can't exceed or equal to max price",
      path: ["minPrice"],
    },
  )
  .refine(
    (data) =>
      data.minPrice == "" ||
      data.maxPrice == "" ||
      (data.minPrice && data.maxPrice && data.minPrice < data.maxPrice),
    {
      message: "Min price can't exceed or equal to max price",
      path: ["maxPrice"],
    },
  )
  .refine(
    (data) =>
      data.minPrice == "" || (data.minPrice && parseInt(data.minPrice) >= 0),
    {
      message: "Min price can't contain negative value",
      path: ["minPrice"],
    },
  )
  .refine(
    (data) =>
      data.maxPrice == "" || (data.maxPrice && parseInt(data.maxPrice) >= 0),
    {
      message: "Max price can't contain negative value",
      path: ["maxPrice"],
    },
  );

export function FilterSearchForm() {
  const { pathname } = useRouter();
  const [cities, setCity] = useState<ICity[]>([]);
  const [cat, setCat] = useState<ICategory[]>([]);
  const { setCategory, setLocation, setMinPrice, setMaxPrice, setMinRating } =
    useFilter.getState();
  const categoryFilter = useFilter.use.category();
  const { getFilterSortSearch } = useProducts.getState();

  const sortByFilter = useFilter.use.sort_by();
  const sortFilter = useFilter.use.sort();
  const qFilter = useFilter.use.q();

  const city = async () => {
    const responseCity = await fetch(`https://ro-wannabe.vercel.app/cities`);
    const resultJSONCity = await responseCity.json();
    const city = resultJSONCity;
    setCity(city);
  };

  const category = async () => {
    const responseCat = await fetch(`${process.env.BASE_API_URL}/categories`);
    const resultJSONCat = await responseCat.json();
    const category = resultJSONCat.data;
    setCat(category);
  };

  useEffect(() => {
    city();
    category();
  }, []);

  const form = useForm<z.infer<typeof FilterSearchFormSchema>>({
    resolver: zodResolver(FilterSearchFormSchema),
    defaultValues: {
      location: [],
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
    },
  });

  function onSubmit(data: z.infer<typeof FilterSearchFormSchema>) {
    if (data.categoryId) {
      setCategory(data.categoryId);
    } else {
      setCategory(categoryFilter as string);
    }
    if (data.location) {
      setLocation(data.location.join(","));
    }
    if (data.minPrice) {
      setMinPrice(data.minPrice);
    }
    if (data.maxPrice) {
      setMaxPrice(data.maxPrice);
    }
    if (data.minRating) {
      setMinRating(data.minRating);
    }
    getFilterSortSearch(
      qFilter as string,
      sortByFilter as string,
      sortFilter as string,
      data.categoryId ? data.categoryId : (categoryFilter as string),
      data.location ? data.location.join(",") : "",
      data.minPrice ? data.minPrice : "",
      data.maxPrice ? data.maxPrice : "",
      data.minRating ? data.minRating : "",
      1,
    );
  }

  function reset() {
    if (
      pathname.includes("[id]") ||
      pathname.includes("[id2]") ||
      pathname.includes("[id]")
    ) {
      setLocation("");
      setMinPrice("");
      setMaxPrice("");
      setMinRating("");
      form.reset({
        location: [],
        minPrice: "",
        maxPrice: "",
        minRating: "",
      });
      form.setValue("minRating", "");
    } else {
      setCategory("");
      setLocation("");
      setMinPrice("");
      setMaxPrice("");
      setMinRating("");
      form.reset({
        location: [],
        categoryId: "",
        minPrice: "",
        maxPrice: "",
        minRating: "",
      });
      form.setValue("categoryId", "");
      form.setValue("minRating", "");
    }
    getFilterSortSearch(
      qFilter as string,
      sortByFilter as string,
      sortFilter as string,
      pathname.includes("[id]") ||
        pathname.includes("[id2]") ||
        pathname.includes("[id]")
        ? (categoryFilter as string)
        : "",
      "",
      "",
      "",
      "",
      1,
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="location"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Location</FormLabel>
                <FormDescription>
                  Select one or more city location.
                </FormDescription>
              </div>
              <div className="md:w-52">
                <div className="flex max-h-48 min-h-0 flex-col gap-3 overflow-y-scroll md:w-52">
                  {cities.map((item) => (
                    <FormField
                      key={item.city_id}
                      control={form.control}
                      name="location"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.city_id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.city_id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value as string[]),
                                        item.city_id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.city_id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.city_name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Min Price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Max Price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!pathname.startsWith("/category") && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="mb-4">
                  <FormLabel className="text-base">Category</FormLabel>
                  <FormDescription>Select a category.</FormDescription>
                </div>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {cat.map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem
                            value={item.id}
                            checked={field.value === item.id}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.name}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="minRating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="mb-4">
                <FormLabel className="text-base">Rating</FormLabel>
                <FormDescription>Select minimum rating.</FormDescription>
              </div>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {rating.map((item) => (
                    <FormItem
                      key={item.id}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem
                          value={item.id}
                          checked={field.value === item.id}
                        />
                      </FormControl>
                      <FormLabel className="flex gap-2 font-normal">
                        <AiTwotoneStar className="w-3" />
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className="flex flex-row justify-end gap-2 md:gap-0">
          <Button type="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit">Apply</Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
