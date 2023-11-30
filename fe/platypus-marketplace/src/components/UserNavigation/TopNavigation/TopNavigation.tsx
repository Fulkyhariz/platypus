import {
  AvatarSmall,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import {
  IoSearchOutline,
  IoCartOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsShop } from "react-icons/bs";
import {
  RiInstagramFill,
  RiTwitterXLine,
  RiFacebookFill,
} from "react-icons/ri";
import { BiFilterAlt } from "react-icons/bi";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import IconButton from "@/components/IconButton/IconButton";
import PlatypusHead from "@/components/SVG/PlatypusHead";
import MerchantCard from "../MerchantCard/MerchantCard";
import CartCard from "../CartCard/CartCard";
import Link from "next/link";
import UserCard from "../UserCard/UserCard";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/store/user/useUser";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { FilterSearchForm } from "@/components/Form/FilterSearchForm";
import { useNavBar } from "@/store/navbar/useNavBar";
import { generateInitialName } from "@/utils/generator";

interface ITopNavigation {
  toggleAside: () => void;
}

function TopNavigation({ toggleAside }: ITopNavigation) {
  const userData = useUser.use.userData();
  const userDefaultAddress = useUser.use.userDefaultAddress();
  const { setNavHeight } = useNavBar.getState();
  const navbarRef = useRef<HTMLElement>(null);
  const { pathname } = useRouter();
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const calculateNavbarHeight = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.clientHeight;
        setNavHeight(height);
      }
    };

    calculateNavbarHeight();

    const handleResize = () => {
      calculateNavbarHeight();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 z-[100] w-full border-b-[1px] border-b-border bg-background/60 px-3 py-3 backdrop-blur md:px-28 2xl:px-72"
    >
      <div className="hidden md:flex md:items-center md:justify-between md:text-xs">
        <div className="flex items-center gap-3">
          <p>Follow us</p>
          <RiFacebookFill className="cursor-pointer transition-colors hover:text-primary hover:transition-colors" />
          <RiInstagramFill className="cursor-pointer transition-colors hover:text-primary hover:transition-colors" />
          <RiTwitterXLine className="cursor-pointer transition-colors hover:text-primary hover:transition-colors" />
        </div>
        <Link
          href="/about"
          className="cursor-pointer transition-colors hover:text-primary hover:transition-colors"
        >
          About Platypus
        </Link>
      </div>
      <div className="flex w-full items-center justify-between gap-2 md:mt-3 ">
        <Link href="/" className="flex space-x-1">
          <PlatypusHead className="h-7 w-7" />
          <h1 className="hidden text-xl font-bold text-primary lg:block">
            Platypus
          </h1>
        </Link>
        <Input
          placeholder={
            pathname.startsWith("/category/[id]")
              ? "Search in category"
              : "Search"
          }
          icon={<IoSearchOutline />}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            e.key === "Enter" &&
              pathname.startsWith("/category/[id]") &&
              (pathname.includes("search")
                ? router.push(
                    `${router.asPath
                      .split("/")
                      .slice(0, 3)
                      .join("/")}/search/${query}`,
                  )
                : router.push(`${router.asPath}/search/${query}`));
            e.key === "Enter" &&
              pathname.startsWith("/category/[id]/[id2]") &&
              (pathname.includes("search")
                ? router.push(
                    `${router.asPath
                      .split("/")
                      .slice(0, 4)
                      .join("/")}/search/${query}`,
                  )
                : router.push(`${router.asPath}/search/${query}`));
            e.key === "Enter" &&
              pathname.startsWith("/category/[id]/[id2]/[id3]") &&
              (pathname.includes("search")
                ? router.push(
                    `${router.asPath
                      .split("/")
                      .slice(0, 5)
                      .join("/")}/search/${query}`,
                  )
                : router.push(`${router.asPath}/search/${query}`));
            e.key === "Enter" &&
              !pathname.startsWith("/category/[id]") &&
              router.push(`/search/${query}`);
          }}
        />
        <div className="flex items-center gap-2">
          {/*Every component that start with hover possible just a boilerplate*/}
          {(pathname.startsWith("/search") ||
            pathname.startsWith("/category")) && (
            <Sheet>
              <SheetTrigger asChild>
                <div className="flex items-center font-medium hover:cursor-pointer lg:hidden">
                  <BiFilterAlt />
                  <p className="text-sm">&nbsp;Filter</p>
                </div>
              </SheetTrigger>
              <SheetContent className="overflow-y-scroll">
                <SheetHeader className="mb-5">
                  <SheetTitle>
                    <div className="flex items-center">
                      <BiFilterAlt />
                      <p className="font-medium">&nbsp;Filter Search</p>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="text-left">
                    Please choose your filter
                  </SheetDescription>
                </SheetHeader>
                <FilterSearchForm />
              </SheetContent>
            </Sheet>
          )}

          {userData ? (
            <HoverCard openDelay={0} closeDelay={50}>
              <HoverCardTrigger>
                <IconButton
                  name="cart"
                  component={<IoCartOutline className="h-5 w-5" />}
                />
              </HoverCardTrigger>
              <HoverCardContent>
                <CartCard />
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Link href={"/login"} className="hidden lg:block">
              <Button variant={"outline"}>Login</Button>
            </Link>
          )}

          <RxHamburgerMenu
            onClick={toggleAside}
            className="h-5 w-5 cursor-pointer hover:text-primary lg:hidden"
          />

          {userData ? (
            <div className="hidden items-center gap-3 border-l-[1px] border-border px-3 lg:flex">
              <HoverCard openDelay={0} closeDelay={50}>
                <HoverCardTrigger>
                  <IconButton
                    name="cart"
                    component={<BsShop className="h-5 w-5 " />}
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  <MerchantCard />
                </HoverCardContent>
              </HoverCard>
              <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger>
                  <AvatarSmall className="cursor-pointer ">
                    <AvatarImage
                      className="object-cover"
                      src={userData.profile_picture}
                      height={50}
                      width={50}
                    />
                    <AvatarFallback>
                      {generateInitialName(
                        userData.first_name,
                        userData.last_name,
                      )}
                    </AvatarFallback>
                  </AvatarSmall>
                </HoverCardTrigger>
                <HoverCardContent>
                  <UserCard />
                </HoverCardContent>
              </HoverCard>
            </div>
          ) : (
            <Link href={"/register"} className="hidden lg:block">
              <Button>Register</Button>
            </Link>
          )}
        </div>
      </div>
      <div className="hidden md:mt-3 md:flex md:justify-between md:text-xs">
        <div className="flex gap-2 lg:pl-[7.8rem]">
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Beauty Supplements
          </Badge>
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Books
          </Badge>
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Kitchen
          </Badge>
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Beverages
          </Badge>
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Gaming
          </Badge>
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Sports
          </Badge>
          <Badge
            variant={"outline"}
            className="cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
          >
            Medicines
          </Badge>
        </div>
        {userData && (
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <IoLocationOutline />
            <p className=" line-clamp-1">
              Deliver to{" "}
              <span className="font-bold">
                {userDefaultAddress && userDefaultAddress.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNavigation;
