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
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiTwotoneStar } from "react-icons/ai";

const FormSchema = z.object({
  review: z
    .string({ required_error: "Please enter product review" })
    .min(10, {
      message: "Review must be at least 10 characters.",
    })
    .max(160, {
      message: "Review must not be longer than 160 characters.",
    }),
  rating: z
    .string({ required_error: "Require product rating" })
    .regex(/^[1-9]/),
});

export function DialogGiveReview() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Your review has been successfully submitted.",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Review Products</DialogTitle>
        <DialogDescription>
          Please know that you cannot edit or remove the review after it
          submitted.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="review"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write down your thoughts about this product"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="5" />
                      </FormControl>
                      <FormLabel className="flex gap-2 font-normal">
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="4" />
                      </FormControl>
                      <FormLabel className="flex gap-2 font-normal">
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="3" />
                      </FormControl>
                      <FormLabel className="flex gap-2 font-normal">
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="2" />
                      </FormControl>
                      <FormLabel className="flex gap-2 font-normal">
                        <AiTwotoneStar className="w-3" />
                        <AiTwotoneStar className="w-3" />
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="1" />
                      </FormControl>
                      <FormLabel className="flex gap-2 font-normal">
                        <AiTwotoneStar className="w-3" />
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default DialogGiveReview;
