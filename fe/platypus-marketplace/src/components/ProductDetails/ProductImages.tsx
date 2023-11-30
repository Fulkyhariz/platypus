import React, { useState } from "react";
import { useProdDetail } from "@/store/prodDetail/useProdDetail";
import { Skeleton } from "../ui/skeleton";
import { Link as ToImage } from "react-scroll";
import { BsArrowRightSquareFill, BsArrowLeftSquareFill } from "react-icons/bs";
import ProductSmallImage from "./ProductSmallImage/ProductSmallImage";
import Zoom from "react-zoom-image-hover";

const ProductImages = () => {
  const productImage = useProdDetail.use.productImages();
  const mainImage = useProdDetail.use.mainImage();
  const activeImage = useProdDetail.use.activeImage();
  const { setMainImage, setActiveImage } = useProdDetail.getState();

  const [prev, setPrev] = useState(-1);
  const [next, setNext] = useState(1);

  const handleNextPrev = (type: "next" | "prev") => {
    if (type === "prev") {
      setPrev((prev) => prev - 1);
      setNext((prev) => prev - 1);
    }
    if (type === "next") {
      setNext((prev) => prev + 1);
      setPrev((prev) => prev + 1);
    }
  };

  if (!productImage) {
    return <Skeleton className="aspect-square h-auto w-full rounded-lg" />;
  }

  return (
    <div className="relative w-full">
      <div className="p-2 max-md:p-0">
        {mainImage ? (
          <Zoom
            className="aspect-square h-auto w-full cursor-zoom-in rounded-lg"
            src={mainImage as string}
            height={""}
            width={""}
            zoomScale={2}
          />
        ) : null}
      </div>
      {prev > -1 && (
        <ToImage
          className="absolute left-0 hidden cursor-pointer text-primary/50 transition-colors hover:text-primary hover:transition-colors lg:bottom-[0.8125rem] lg:block lg:h-5 lg:w-5 xl:bottom-4 xl:h-7 xl:w-7"
          spy={true}
          smooth={true}
          duration={500}
          to={`img${prev}`}
          containerId="product-images"
          horizontal
          onClick={() => handleNextPrev("prev")}
        >
          <BsArrowLeftSquareFill className="h-full w-full" />
        </ToImage>
      )}
      {next < productImage.length - 4 && (
        <ToImage
          className="absolute right-0 hidden cursor-pointer text-primary/50 transition-colors hover:text-primary hover:transition-colors lg:bottom-[0.8125rem] lg:block lg:h-5 lg:w-5 xl:bottom-4 xl:h-7 xl:w-7"
          spy={true}
          smooth={true}
          duration={500}
          to={`img${next}`}
          containerId="product-images"
          horizontal
          onClick={() => handleNextPrev("next")}
        >
          <BsArrowRightSquareFill className="h-full w-full" />
        </ToImage>
      )}
      <div
        className="flex w-full overflow-x-scroll lg:overflow-x-hidden"
        id="product-images"
      >
        {productImage.map((image, index) => (
          <ProductSmallImage
            key={`img${index}`}
            className="min-h-[20%] min-w-[20%] p-2"
            isActive={index === activeImage}
            name={`img${index}`}
            onMouseEnter={() => setMainImage(image)}
            onMouseLeave={() => setMainImage(productImage[activeImage])}
            onClick={() => setActiveImage(index)}
            image={image}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
