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
import { Input } from "@/components/ui/input";
import GoogleEntryButton from "../GoogleAuth/GoogleEntryButton";
import { ClientSafeProvider, LiteralUnion } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDate } from "@/utils/formatDate";
import service from "@/services/services";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import Link from "next/link";
import HeaderLined from "../Header/HeaderLined";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import { InputPrimeIcon } from "../Input/InputPrimeIcon";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface IGoogleEntryProvider {
  providers: Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>;
}

const registerFormSchema = z
  .object({
    username: z
      .string()
      .min(6, {
        message: "Username must be at least 6 characters.",
      })
      .refine((value) => /^[a-zA-Z0-9-_]+$/.test(value), {
        message:
          "Username can only contain letters, numbers, '-' and '_',. no space and special character allowed",
      }),
    password: z
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
    email: z.string().email({ message: "Mus be a valid email" }),
    first_name: z
      .string()
      .min(1, {
        message: "First name must be at least 6 characters.",
      })
      .refine((value) => /^[a-zA-Z ]+$/.test(value), {
        message: "First name can only contain letters",
      }),
    last_name: z
      .string()
      .min(1, {
        message: "Last name must be at least 6 characters.",
      })
      .refine((value) => /^[a-zA-Z ]+$/.test(value), {
        message: "Last name can only contain letters",
      }),
    gender: z.enum(["M", "F"], {
      required_error: "You need to select a gender type.",
    }),
    phone_number: z
      .string()
      .regex(/^[1-9]/, { message: "first number must be not 0" }),
    date_of_birth: z.date({
      required_error: "A date of birth is required.",
    }),
  })
  .refine((data) => !data.password.toLowerCase().includes(data.username), {
    message: "Password can't contain username",
    path: ["password"],
  });

const RegisterForm = ({ providers }: IGoogleEntryProvider) => {
  const [slide, setSlide] = useState<number>(0);
  const { toast } = useToast();
  const [showPasswod, setShowPassword] = useState<boolean>(false);
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
    },
  });

  const onToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handlerSlideToNextForm = () => {
    setSlide(1);
  };
  const handlerSlideToPrevForm = () => {
    setSlide(0);
  };

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    showLoadingSm();
    const formattedDate = formatDate(String(values.date_of_birth));
    const payloadRegister = {
      ...values,
      phone_number: `+62${values.phone_number}`,
      date_of_birth: String(formattedDate),
    };

    const { error, code, message } =
      await service.postRegisterUser(payloadRegister);

    if (error) {
      toast({
        title: message.message
          ? message.message
          : message
          ? message
          : "Something happened in the server",
        variant: "destructive",
      });
      hideLoadingSm();
    }
    if (!error && code === 201) {
      toast({
        title: "Success Register",
        description: "You now can login using this account",
        variant: "success",
      });
      hideLoadingSm();
      router.push("/login");
    }
  }
  return (
    <div className="mt-5 w-[80vw] space-y-1 rounded-lg border-border p-5 shadow-drop-line lg:mt-0 lg:w-[30rem] lg:space-y-5">
      <p className="text-center text-2xl font-bold text-primary">Platypus</p>
      <div className="flex flex-col justify-center gap-1 text-center text-xs lg:flex-row lg:text-base">
        <p className="hidden lg:block">
          Ayo typus, you have an account already?{" "}
        </p>
        <Link
          href={"/login"}
          className="text-primary transition-transform hover:underline hover:transition-transform"
        >
          Login Here
        </Link>
      </div>
      <div className="py-6">
        <GoogleEntryButton providers={providers} />
      </div>
      <HeaderLined className="text-sm lg:text-base">
        Or Register with
      </HeaderLined>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, handlerSlideToPrevForm)}
          className=" mt-3 overflow-x-hidden"
        >
          <div
            className="flex w-[200%] transition-transform duration-300"
            style={{ transform: `translateX(${-(slide * 50)}%)` }}
          >
            <div className="w-[50%] space-y-3 px-1">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">Password</FormLabel>
                    <FormControl>
                      <InputPrimeIcon
                        icon={
                          showPasswod ? (
                            <FaRegEye
                              className=" cursor-pointer"
                              onClick={onToggleShowPassword}
                            />
                          ) : (
                            <FaRegEyeSlash
                              className=" cursor-pointer"
                              onClick={onToggleShowPassword}
                            />
                          )
                        }
                        iconEnd
                        type={showPasswod ? "text" : "password"}
                        placeholder="password"
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
                      <InputPrimeIcon
                        icon="+62"
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
                <Button onClick={handlerSlideToNextForm} type="button">
                  Next
                </Button>
              </div>
            </div>
            <div className="w-[50%] space-y-3 px-1">
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown-buttons"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          fromYear={1960}
                          toYear={2030}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Firstname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lastname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center justify-center "
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="M" />
                          </FormControl>
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="F" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center gap-3 pt-5">
                <Button
                  onClick={handlerSlideToPrevForm}
                  variant={"outline"}
                  type="button"
                >
                  Previous
                </Button>
                <ButtonWithLoading
                  name="register-button"
                  buttonContent="Register"
                  loadingContent="Registering..."
                  type="submit"
                ></ButtonWithLoading>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
