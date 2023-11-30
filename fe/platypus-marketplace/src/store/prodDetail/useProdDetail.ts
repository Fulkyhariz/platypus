/*eslint no-unused-vars: "off"*/
import { create } from "zustand";
import { createZusSelector } from "../createZusSelector";
import {
  IOnlyParentVariant,
  IParentHasChildVariant,
  IParentVariant,
  IProductDetail,
  IProductMerchant,
  IProductMerchantRecommendation,
} from "@/interfaces/productDetail";
import { IReview } from "@/interfaces/productReview";
import service from "@/services/services";
import { IPaginationData } from "@/interfaces/pagination";
import { toast } from "@/components/ui/use-toast";

type State = {
  productDetail: IProductDetail | undefined;
  categories: { id: string; name: string }[] | undefined;
  parentVariants: IOnlyParentVariant[] | IParentVariant[] | undefined;
  childVariants: IParentHasChildVariant[] | undefined;
  chosenParent: number;
  chosenChild: number;
  variantType: "parent" | "child";
  merchantInfo: IProductMerchant | undefined;
  productImages: string[] | undefined;
  mainImage: string | undefined;
  activeImage: number;
  totalDefImage: number;
  productReview: IReview[] | undefined;
  pageInformation: IPaginationData | undefined;
  isFavorite: boolean;
  merchantProducts: IProductMerchantRecommendation[] | undefined;
  chosenVariantCombination: number | undefined;
};

type Actions = {
  setProductDetail: (productData: IProductDetail) => void;
  getProductRecommendation: (productDetail: IProductDetail) => void;
  changeParent: (index: number) => void;
  changeChild: (index: number) => void;
  setMainImage: (url: string) => void;
  setActiveImage: (index: number) => void;
  likeProduct: () => void;
  dislikeProduct: () => void;
  getFavoriteStatus: (prodId: number) => void;
  getProductReview: (
    id: number,
    page: number,
    sort: "oldest" | "newest",
    images: boolean,
    comment: boolean,
    rating: number,
  ) => void;
  changeVarCombination: (varId: number) => void;
};

const useProdDetailBase = create<State & Actions>((set) => ({
  productDetail: undefined,
  categories: undefined,
  parentVariants: undefined,
  childVariants: undefined,
  chosenParent: 0,
  chosenChild: 0,
  variantType: "parent",
  merchantInfo: undefined,
  productImages: undefined,
  mainImage: undefined,
  activeImage: 0,
  totalDefImage: 0,
  productReview: undefined,
  pageInformation: undefined,
  isFavorite: false,
  merchantProducts: undefined,
  chosenVariantCombination: undefined,
  changeVarCombination: (varId: number) => {
    set(() => ({ chosenVariantCombination: varId }));
  },
  getFavoriteStatus: async (prodId: number) => {
    const { data } = await service.getFavProductDetail(prodId);

    set(() => ({ isFavorite: data.data.is_favorite }));
  },
  getProductRecommendation: async (productDetail: IProductDetail) => {
    if (productDetail) {
      const { error, data } = await service.getProductMerchantRecommendation(
        productDetail.username,
      );
      set(() => ({ merchantProducts: data.data }));

      if (error) {
        toast({
          title: "Failed to retrieve recommendation product",
          variant: "destructive",
        });
      }
    }
  },
  likeProduct: async () => {
    const { productDetail } = useProdDetail.getState();
    const { error, message } = await service.postLikeProduct({
      product_id: productDetail?.product_id,
    });

    if (error) {
      toast({
        title: message,
        variant: "destructive",
      });
    } else {
      set(() => ({ isFavorite: true }));
      toast({
        title: "Liked",
        description: `For product ${productDetail?.product_name}`,
        variant: "success",
      });
    }
  },
  dislikeProduct: async () => {
    const { productDetail } = useProdDetail.getState();
    const { error, message } = await service.deleteLikeProduct({
      product_id: productDetail?.product_id,
    });
    if (error) {
      toast({
        title: message,
        variant: "destructive",
      });
    } else {
      set(() => ({ isFavorite: false }));
      toast({
        title: "Disliked",
        description: `For product ${productDetail?.product_name}`,
        variant: "success",
      });
    }
  },
  getProductReview: async (
    id: number,
    page: number,
    sort: "oldest" | "newest",
    images: boolean,
    comment: boolean,
    rating: number,
  ) => {
    const { error, data, code } = await service.getProductReviews(
      id,
      page,
      sort,
      images,
      comment,
      rating,
    );

    if (error) {
      console.error(error);
    } else {
      set(() => ({
        productReview: data.data,
        pageInformation: data.meta.pagination_info,
      }));
    }
  },
  setProductDetail: (productData: IProductDetail) => {
    const prodCategories: { id: string; name: string }[] = [];

    prodCategories.push({
      id: productData.category_lv_1.id,
      name: productData.category_lv_1.name,
    });
    productData.category_lv_1.category_lv_2 &&
      prodCategories.push({
        id: productData.category_lv_1.category_lv_2.id,
        name: productData.category_lv_1.category_lv_2.name,
      });
    productData.category_lv_1.category_lv_2?.category_lv_3 &&
      prodCategories.push({
        id: productData.category_lv_1.category_lv_2.category_lv_3.id,
        name: productData.category_lv_1.category_lv_2.category_lv_3.name,
      });

    if (productData.variant) {
      if (
        Array.isArray(productData.variant) &&
        productData.variant.every((v) => "variant_child" in v)
      ) {
        let variantParents: IParentVariant[] = [];
        let variantWithChild = productData.variant as IParentHasChildVariant[];
        let variantImage: string[] = [];

        variantImage.push(productData.default_photo);
        if (productData.photos) {
          productData.photos.forEach((photo) => {
            variantImage.push(photo);
          });
        }
        productData.variant.forEach((element) => {
          if (element.parent_picture) {
            variantImage.push(element.parent_picture);
          }
        });
        productData.variant.forEach((item) => {
          const { parent_name, parent_group, price, parent_picture } = item;
          variantParents.push({
            parent_name,
            parent_group,
            price,
            parent_picture,
          });
        });

        set(() => ({
          variantType: "child",
          parentVariants: variantParents,
          childVariants: productData.variant as IParentHasChildVariant[],
          merchantInfo: productData.merchant,
          productImages: variantImage,
          mainImage: productData.default_photo,
          totalDefImage: productData.photos.length,
          chosenVariantCombination:
            variantWithChild[0].variant_child[0].variant_combination_product_id,
        }));
      } else {
        let variantImage: string[] = [];
        variantImage.push(productData.default_photo);

        if (productData.photos) {
          productData.photos.forEach((photo) => {
            variantImage.push(photo);
          });
        }
        productData.variant.forEach((element) => {
          if (element.parent_picture) {
            variantImage.push(element.parent_picture);
          }
        });
        set(() => ({
          variantType: "parent",
          parentVariants: productData.variant as IOnlyParentVariant[],
          merchantInfo: productData.merchant,
          productImages: variantImage,
          mainImage: productData.default_photo,
          totalDefImage: productData.photos.length,
          chosenVariantCombination:
            productData.variant[0].variant_combination_product_id,
        }));
      }
    }

    set(() => ({
      productDetail: productData,
      categories: prodCategories,
    }));
  },
  changeParent: (index: number) => {
    set(() => ({ chosenParent: index }));
  },
  changeChild: (index: number) => {
    set(() => ({ chosenChild: index }));
  },
  setMainImage: (url: string) => {
    if (url) {
      set(() => ({ mainImage: url }));
    }
  },
  setActiveImage: (index: number) => {
    set(() => ({ activeImage: index }));
  },
}));

export const useProdDetail = createZusSelector(useProdDetailBase);
