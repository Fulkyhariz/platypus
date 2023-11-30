import React from "react";
import PlatypusHead from "@/components/SVG/PlatypusHead";
import Link from "next/link";
import Image from "next/image";
import {
  RiInstagramFill,
  RiTwitterXLine,
  RiFacebookFill,
} from "react-icons/ri";
import { FcCopyright } from "react-icons/fc";
import { Badge } from "../ui/badge";
import { FaWallet } from "react-icons/fa";

function Footer() {
  return (
    <div className="w-full border-t-[1px] border-b-border bg-background/60 px-3 py-3 backdrop-blur md:px-28 2xl:px-72">
      <div className="border-b-[.1px] border-b-border pb-5 md:pb-10">
        <h2 className="mb-5 text-base font-medium md:text-lg">
          Platypus Indonesia
        </h2>
        <p className="md:text:sm text-xs">
          Platypus is the first mobile platform in Southeast Asia (Indonesia,
          Philippines, Malaysia, Singapore, Thailand, Vietnam) and Taiwan to
          offer fun, free and reliable online buying and selling transactions
          via mobile phone. Join millions of other users by starting to list
          products for sale and shop for attractive offers anytime, anywhere.
          The security of your transactions is guaranteed... Come on, join the
          Platypus community and start shopping now!
        </p>
      </div>
      <nav className="flex flex-col pt-5 md:flex-row md:justify-between md:pt-10">
        <div>
          <h2 className="mb-5 text-base font-medium md:text-lg">
            Explore Platypus
          </h2>
          <Link
            href="/about"
            className="md:text:sm mb-2 block cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
          >
            About Us
          </Link>
          <Link
            href="#"
            className="md:text:sm mb-2 block cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
          >
            Terms and Condition
          </Link>
          <Link
            href="#"
            className="md:text:sm mb-2 block cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
          >
            Seller Centre
          </Link>
          <Link
            href="#"
            className="md:text:sm mb-2 block cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
          >
            Promotions
          </Link>
        </div>
        <div>
          <h2 className="mb-5 text-base font-medium md:text-lg">
            Payment Partners
          </h2>
          <div className="flex w-fit items-center gap-2 rounded bg-gradient-to-r from-fuchsia-400 via-violet-500 to-violet-500 p-3 font-extrabold text-white shadow-2xl md:mb-5">
            <FaWallet className="h-4 w-4" />
            <p className="italic">Platypay</p>
          </div>
          <h2 className="mb-5 text-base font-medium md:text-lg">
            Delivery Partners
          </h2>
          <div className="mb-3 flex flex-col gap-y-5">
            <Image
              src="https://res.cloudinary.com/dro3sbdac/image/upload/v1700725973/h4hvburldrz5gbhpy0cg.png"
              height="100"
              width="100"
              alt=""
            />
            <Image
              src="https://res.cloudinary.com/dro3sbdac/image/upload/v1700726568/wvkxuc3vmunko6bmj1av.png"
              height="100"
              width="100"
              alt=""
            />
            <Image
              src="https://res.cloudinary.com/dro3sbdac/image/upload/v1700725953/cuwknhoddihpy8eiebmn.png"
              height="100"
              width="100"
              alt=""
            />
          </div>
        </div>
        <div>
          <h2 className="mb-5 text-base font-medium md:text-lg">Follow us</h2>
          <div className="mb-2 flex items-center gap-2">
            <RiFacebookFill className="inline" />
            <Link
              href="#"
              className="md:text:sm cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
            >
              Our Facebook Page
            </Link>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <RiInstagramFill className="inline" />
            <Link
              href="#"
              className="md:text:sm cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
            >
              Our Instagram
            </Link>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <RiTwitterXLine className="inline" />
            <Link
              href="#"
              className="md:text:sm cursor-pointer text-xs transition-colors hover:text-primary hover:transition-colors"
            >
              Our Twitter
            </Link>
          </div>
        </div>
        <div>
          <p className="md:text:2xl mb-5 pt-5 text-xl font-medium md:pt-0">
            Platypus
          </p>
          <PlatypusHead className="block w-[110px] md:w-[150px]" />
          <div>
            <Badge
              variant={"outline"}
              className="my-5 cursor-pointer font-normal text-foreground transition-colors hover:bg-primary hover:text-background hover:transition-colors"
            >
              Need Help?
            </Badge>
          </div>
        </div>
      </nav>
      <div className="md:text:sm mt-5 flex items-center gap-1 text-xs">
        <FcCopyright />
        <p>2023. All right reserved by Platypus.</p>
      </div>
    </div>
  );
}

export default Footer;
