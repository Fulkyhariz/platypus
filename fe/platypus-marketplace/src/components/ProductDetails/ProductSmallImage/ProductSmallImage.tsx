import React from "react";
import ImageWithFallback from "../../ImageWithFallback/ImageWithFallback";
import { ElementProps } from "react-scroll/modules/components/Element";
import classNames from "classnames";
import styles from "./ProductSmallImage.module.scss";

interface IProductSmallImage extends ElementProps {
  image: string;
  isActive?: boolean;
}

const ProductSmallImage = ({
  image,
  isActive,
  ...rest
}: IProductSmallImage) => {
  const productSmallImageClasses = classNames(styles.smallImageContainer, {
    [styles.inActive]: !isActive,
    [styles.active]: isActive,
  });
  return (
    <div {...rest}>
      <ImageWithFallback
        key={image}
        className={productSmallImageClasses}
        alt={"product_image"}
        src={image}
        height={50}
        width={50}
        loading="lazy"
        fallbackSrc={process.env.IMAGE_FALLBACK as string}
        placeholder="empty"
      />
    </div>
  );
};

export default ProductSmallImage;
