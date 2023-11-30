import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithFallbackProps extends ImageProps {
  src: string;
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = "https://res.cloudinary.com/dro3sbdac/image/upload/v1699763358/hksqarsowqiozwtcgzs2.png",
  alt = "platypus",
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      alt={alt}
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default ImageWithFallback;
