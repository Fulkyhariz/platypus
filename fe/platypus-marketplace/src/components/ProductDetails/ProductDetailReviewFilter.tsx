"use client";
import React from "react";

import { Checkbox } from "@/components/ui/checkbox";

import { BsStarFill } from "react-icons/bs";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { IProductDetailReviewFilter } from "@/interfaces/productReview";

const ProductDetailReviewFilter = ({
  onChangeReviewFilter,
}: IProductDetailReviewFilter) => {
  return (
    <>
      <div className="border-b-[1px] border-border p-3">
        <p className="text-lg font-bold">Filter Review</p>
      </div>
      <div className="space-y-3 p-3">
        <div className="flex flex-row items-center space-x-3 space-y-0">
          <Checkbox
            id="images"
            onCheckedChange={(checked) => {
              checked
                ? onChangeReviewFilter(true, "images")
                : onChangeReviewFilter(false, "images");
            }}
          />
          <label
            htmlFor="images"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            With Image
          </label>
        </div>
        <div className="flex flex-row items-center space-x-3 space-y-0">
          <Checkbox
            id="comment"
            onCheckedChange={(checked) => {
              checked
                ? onChangeReviewFilter(true, "comment")
                : onChangeReviewFilter(false, "comment");
            }}
          />
          <label
            htmlFor="comment"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            With Comment
          </label>
        </div>
        <div className="flex flex-row items-center space-x-3 space-y-0">
          <Checkbox
            id="sort"
            onCheckedChange={(checked) => {
              checked
                ? onChangeReviewFilter("oldest", "sort")
                : onChangeReviewFilter("newest", "sort");
            }}
          />
          <label
            htmlFor="sort"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Oldest
          </label>
        </div>
        <RadioGroup
          onValueChange={(value) => {
            onChangeReviewFilter(parseInt(value), "rating");
          }}
          defaultValue={"0"}
        >
          <p className="font-bold">Rating</p>
          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="5" />
            <div className="font-normal">
              <div className="flex items-center gap-1">
                <BsStarFill className="text-yellow-500" />5
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="4" />
            <div className="font-normal">
              <div className="flex items-center gap-1">
                <BsStarFill className="text-yellow-500" />4
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="3" />

            <div className="font-normal">
              <div className="flex items-center gap-1">
                <BsStarFill className="text-yellow-500" />3
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="2" />

            <div className="font-normal">
              <div className="flex items-center gap-1">
                <BsStarFill className="text-yellow-500" />2
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="1" />
            <div className="font-normal">
              <div className="flex items-center gap-1">
                <BsStarFill className="text-yellow-500" />1
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="0" />
            <div className="font-normal">
              <div className="flex items-center gap-1">
                <BsStarFill className="text-yellow-500" />
                All
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default ProductDetailReviewFilter;
