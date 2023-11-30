"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSession, signOut } from "next-auth/react";
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
import service from "@/services/services";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { useLoading } from "@/store/loading/useLoading";
import Link from "next/link";
import HeaderLined from "../Header/HeaderLined";
import { Button } from "../ui/button";
import { useState } from "react";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { InputPrimeIcon } from "../Input/InputPrimeIcon";
import { useUser } from "@/store/user/useUser";

interface IGoogleEntryProvider {
  providers: Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>;
}

const loginFormSchema = z.object({
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
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const LoginForm = ({ providers }: IGoogleEntryProvider) => {
  const { data: session } = useSession();
  const [showPasswod, setShowPassword] = useState<boolean>(false);
  const { hideLoadingSm, showLoadingSm } = useLoading.getState();
  const { setUserData } = useUser.getState();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onToggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    showLoadingSm();
    const { error, data, code, message } = await service.postLogin(values);

    if (error && code === 500) {
      hideLoadingSm();
      toast({
        title: "Something happened in the server",
        variant: "destructive",
      });
    }
    if (error) {
      hideLoadingSm();
      toast({
        title: message,
        variant: "destructive",
      });
    }
    if (!error && code === 200) {
      hideLoadingSm();
      console.log(data.data.user_data);

      setUserData(data.data.user_data);
      toast({
        title: "Success Login",
        variant: "success",
      });
      setCookie("refreshToken", data.data.refresh_token);
      setCookie("accessToken", data.data.access_token);
      router.push("/");
    }
  }

  return (
    <div className="mt-5 w-[80vw] rounded-lg border-[1px] border-border bg-background p-5 shadow-drop-line lg:mt-0 lg:w-[30rem]">
      {session ? (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="font-bold text-primary">Logging in...</p>
          <span className="loading loading-dots loading-lg text-primary"></span>
          <Button type="button" onClick={() => signOut()}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-5">
          <p className="text-center text-2xl font-bold text-primary">
            Platypus
          </p>
          <div className="flex flex-col justify-center gap-1 text-center text-xs lg:flex-row lg:text-base">
            {/* <div className="flex flex-col justify-center gap-1 text-xs lg:flex-row lg:text-base"> */}
            <p className="hidden lg:block">{`Hey platy, don't have an account yet?`}</p>
            <Link
              href={"/register"}
              className="text-primary transition-transform hover:underline hover:transition-transform"
            >
              Register Here
            </Link>
          </div>
          <div className="py-6">
            <GoogleEntryButton providers={providers} />
          </div>
          <HeaderLined className="text-sm lg:text-base">
            Or login with
          </HeaderLined>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-base">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage className="font-thin" />
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
                    <FormMessage className="font-thin" />
                  </FormItem>
                )}
              />
              <div className="flex w-full justify-center pt-5 ">
                {/* <Button type="submit">Login</Button> */}
                <ButtonWithLoading
                  buttonContent="Login"
                  loadingContent="Logging in"
                  className="w-full lg:w-fit"
                />
              </div>
            </form>
          </Form>
          <Link
            className=" text-xs text-primary transition-transform hover:underline hover:transition-transform lg:text-base"
            href={"/forgot-password"}
          >
            <p className="mt-5">Forgot Password</p>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
