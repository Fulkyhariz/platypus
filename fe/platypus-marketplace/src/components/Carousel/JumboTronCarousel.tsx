import Image from "next/image";
import React, { useEffect, useState } from "react";

import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
interface IJumboTronCarousel {
  images: string[];
}
const JumboTronCarousel = ({ images }: IJumboTronCarousel) => {
  const [slide, setSlide] = useState(0);
  // let directElement = [];

  const handleNextSlide = () => {
    if (slide < images.length - 1) {
      setSlide((prev) => prev + 1);
    } else {
      setSlide(0);
    }
  };
  const handlePrevSlide = () => {
    if (slide > 0) {
      setSlide((prev) => prev - 1);
    } else {
      setSlide(images.length - 1);
    }
  };

  const handleDirectSlide = (index: number) => {
    setSlide(index);
  };

  const autoSlide = () => {
    handleNextSlide();
  };

  useEffect(() => {
    const interval = setInterval(autoSlide, 5000);

    return () => clearInterval(interval);
  }, [slide]);

  let directElement = [];

  for (let i = 0; i < images.length; i++) {
    directElement.push(
      <button
        style={{
          width: `${i === slide ? "3rem" : "0.75rem"}`,
          backgroundColor: `${
            i === slide ? "rgb(124, 58, 237)" : "rgb(255,255,255)"
          }`,
        }}
        className={`z-[5] h-3 rounded-full shadow-lg transition-width duration-300 max-md:h-1`}
        onClick={() => handleDirectSlide(i)}
      ></button>,
    );
  }
  return (
    <>
      <div className="group relative flex w-full overflow-hidden rounded-lg ">
        <button
          className="absolute bottom-[53%] left-0 top-[47%] z-[5] h-fit w-fit translate-x-7 rounded-full bg-background opacity-0 shadow-lg outline-none transition duration-500 hover:bg-primary hover:text-white group-hover:translate-x-3 group-hover:opacity-100 group-hover:transition group-hover:duration-500  "
          onClick={handlePrevSlide}
        >
          <MdKeyboardArrowLeft className="m-1 h-8 w-8 rounded-full max-md:h-2 max-md:w-2" />
        </button>
        <button
          className="absolute bottom-[53%] right-0 top-[47%] z-[5] h-fit w-fit -translate-x-7 rounded-full bg-background opacity-0 shadow-lg outline-none transition duration-500 hover:bg-primary hover:text-white group-hover:-translate-x-3 group-hover:opacity-100 group-hover:transition group-hover:duration-500 "
          onClick={handleNextSlide}
        >
          <MdKeyboardArrowRight className="m-1 h-8 w-8 rounded-full max-md:h-2 max-md:w-2" />
        </button>
        <div className="absolute bottom-3 flex h-fit w-full justify-center space-x-3 max-md:bottom-1">
          {directElement}
        </div>
        {images.map((image) => (
          <div
            key={`banner-${image}`}
            style={{ transform: `translateX(-${slide * 100}%)` }}
            className=" h-80 min-w-full rounded-lg transition-transform duration-1000 max-md:h-24"
          >
            <Image
              className="h-full w-full rounded-lg object-cover"
              src={image}
              alt={image}
              width={1000}
              height={1000}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default JumboTronCarousel;
