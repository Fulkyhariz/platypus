import { IReview } from "@/interfaces/productReview";
import { formatDateLong } from "@/utils/formatDateLong";
import React from "react";
import { BsStar, BsStarFill } from "react-icons/bs";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { generateInitialName } from "@/utils/generator";
import Image from "next/image";

interface IUserReview {
  review: IReview;
}

const UserReview = ({ review }: IUserReview) => {
  let unFilledStart = 5 - review.rating;
  const starElement = [];
  const diedStar = [];
  for (let i = 0; i < review.rating; i++) {
    starElement.push(<BsStarFill />);
  }
  for (let i = 0; i < unFilledStart; i++) {
    diedStar.push(<BsStar />);
  }

  return (
    <div className="mt-3 w-full space-y-3 border-b-[1px] border-border pb-3">
      <div className="flex items-center gap-1 text-yellow-500 dark:text-primary">
        {starElement}
        {diedStar}
        <p className="ml-3 text-foreground">
          {formatDateLong(review.created_at)}
        </p>
      </div>
      <div className="flex items-center">
        <Avatar>
          <AvatarImage
            height={50}
            width={50}
            className=" object-contain"
            src={review.profile_picture}
          />
          <AvatarFallback>
            {generateInitialName(review.user_name)}
          </AvatarFallback>
        </Avatar>
        <p className="font-bold">{review.user_name}</p>
      </div>
      <div className="flex">
        {review.images &&
          review.images.map((image, i) => (
            <Image
              key={`review-${review.id}-${i}`}
              src={image}
              height={100}
              width={100}
              alt={image}
            />
          ))}
      </div>
      <div>{review.comment}</div>
    </div>
  );
};

export default UserReview;
