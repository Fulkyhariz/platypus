import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AiTwotoneStar } from "react-icons/ai";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { formatIDR } from "@/utils/formatIDR";
import Link from "next/link";

interface ProductCardProps {
  url?: string;
  name: string;
  price: number;
  sold: number;
  city?: string;
  rating: string | "0";
  id: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  url,
  name,
  price,
  sold,
  rating,
  city,
  id,
}: ProductCardProps) => {
  return (
    <Link href={`/detail/${id}`}>
      <Card className="w-full translate-y-0 rounded-lg border-none shadow-lg transition-transform duration-500 hover:-translate-y-2 hover:cursor-pointer hover:transition-transform hover:duration-100">
        <CardHeader className="relative h-36 w-full rounded-tl-lg rounded-tr-lg bg-primary/20 md:h-40">
          <Image
            src={url as string}
            loading="lazy"
            alt={name}
            height={300}
            width={300}
            className="absolute left-0 top-0 h-36 w-full rounded-tl-lg rounded-tr-lg object-cover md:h-40"
          />
          <div className="absolute bottom-0 left-0 flex h-6 w-14 items-center justify-between rounded-tr-lg bg-background p-2">
            <AiTwotoneStar className="w-3" />
            <p className="text-sm">{rating}</p>
          </div>
        </CardHeader>
        <CardContent className="h-[130px] w-full flex-1 flex-col px-2 py-3 md:h-[120px]">
          <div className="flex h-full flex-col justify-between gap-y-2">
            <div className="line-clamp-2 w-full">
              <p>{name}</p>
            </div>
            <div>
              <p className="p-0 font-semibold">{formatIDR(price)}</p>
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <IoLocationOutline className="h-3 w-3" />
                  <p className=" line-clamp-1 text-xs">{city}</p>
                </div>
                <p className=" text-xs">{sold} sold</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
export default ProductCard;
