"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useEffect, useState } from "react";
import { InputWithDescription } from "../Input/InputWithDescription";
import UniInputDescription from "../Input/UniInputDescription";
import { useProducts } from "@/store/products/useProducts";
import ButtonWithLoading from "../Button/ButtonWithLoading";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RiImageAddLine } from "react-icons/ri";
import Image from "next/image";
import { useToast } from "../ui/use-toast";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { InputPrimeIcon } from "../Input/InputPrimeIcon";
import { cloudinaryUpload } from "@/utils/cloudinaryUpload";
import { useLoading } from "@/store/loading/useLoading";
import { IResponseApi } from "@/interfaces/responses";
import service from "@/services/services";
import { WithContext as ReactTags } from "react-tag-input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import VariantTable from "../AddProduct/VariantTable";
import {
  IVariantType,
  ITypeValue,
  ITypeValueWithChild,
} from "@/interfaces/product";
import { FaRegTrashCan } from "react-icons/fa6";
import { IProdDetailEditData } from "@/interfaces/productDetail";
import { ICategory } from "@/pages";
import { useRouter } from "next/router";

const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeUrlRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeUrlRegex.test(url);
};

const FormSchema = z
  .object({
    with_parent: z.boolean(),
    with_child: z.boolean(),
    title: z
      .string({ required_error: "Please enter product name" })
      .min(10, { message: "Product title must be at least 10 characters" })
      .max(100, { message: "Product title must be less than 100 characters" }),
    category_lv1_id: z.string().nullable(),
    category_lv2_id: z.string().nullable(),
    category_lv3_id: z.string().nullable(),
    is_used: z.boolean({ required_error: "Please choose product type" }),
    is_hazardous: z.boolean({ required_error: "Please choose product type" }),
    description: z
      .string()
      .min(20, { message: "Description must be at least 20 characters" })
      .max(2000, {
        message: "Description must not be longer than 2000 characters",
      }),
    video: z.string().min(0),
    price: z
      .string()
      .regex(/^[1-9]/)
      .refine((value) => parseInt(value) >= 100, {
        message: "Minimal price is Rp 100",
      })
      .refine((value) => parseInt(value) <= 100000000000000, {
        message: "Maximal price is Rp 100,000,000,000,000",
      }),
    stock: z
      .string()
      .regex(/^[0-9]/)
      .refine((value) => parseInt(value) <= 100000, {
        message: "Maximal stock is 100.000",
      }),
    weight: z
      .string()
      .regex(/^[1-9]/)
      .refine((value) => parseInt(value) <= 100000, {
        message: "Maximal weight is 100.000",
      }),
    length: z
      .string()
      .regex(/^[1-9]/)
      .refine((value) => parseInt(value) >= 1, {
        message: "Minimal length is 1cm",
      })
      .refine((value) => parseInt(value) <= 1000, {
        message: "Maximal length is 1000cm",
      }),
    width: z
      .string()
      .regex(/^[1-9]/)
      .refine((value) => parseInt(value) >= 1, {
        message: "Minimal width is 1cm",
      })
      .refine((value) => parseInt(value) <= 1000, {
        message: "Maximal width is 1000cm",
      }),
    height: z
      .string()
      .regex(/^[1-9]/)
      .refine((value) => parseInt(value) >= 1, {
        message: "Minimal height is 1cm",
      })
      .refine((value) => parseInt(value) <= 1000, {
        message: "Maximal height is 1000cm",
      }),
    variant_parents: z.string({
      required_error: "Please select variant group 1",
    }),
    variant_childs: z.string({
      required_error: "Please select variant group 2",
    }),
  })
  .refine((data) => data.video === "" || isValidYouTubeUrl(data.video), {
    message: "Invalid YouTube URL",
    path: ["video"],
  });

const KeyCodes = {
  comma: 188,
  enter: 13,
};
const delimiters = [KeyCodes.comma, KeyCodes.enter];

interface IEditProductForm {
  editProductData: IProdDetailEditData;
}

export function EditProductForm({ editProductData }: IEditProductForm) {
  const router = useRouter();
  const [productImages, setProductImages] = useState<(File | string)[]>([]);
  const [productTypeVariantImages, setProductTypeVariantImages] = useState<
    (File | string)[]
  >([]);
  const [varianParent, setVariantParent] = useState<boolean>(false);
  const [varianChild, setVariantChild] = useState<boolean>(false);
  const [newVarParent, setNewVarparent] = useState<string>("");
  const [variant1, setVariant1] = useState<string>("");
  const [variant2, setVariant2] = useState<string>("");
  const { getAllCategory } = useProducts.getState();
  const { showLoadingSm, hideLoadingSm } = useLoading.getState();
  const categories = useProducts.use.categories();
  const { toast } = useToast();
  const [variantParentSelection, setVariantParentSelection] = useState<
    string[]
  >(["Color", "Size"]);
  const [variantChildSelection, setVariantChildSelection] = useState<string[]>(
    [],
  );
  const [parentType, setParentType] = React.useState<IVariantType[]>([]);
  const [childType, setChildType] = React.useState<IVariantType[]>([]);
  const [var1Type, setVar1Type] = useState<ITypeValue[]>([]);
  const [var2Type, setVar2Type] = useState<ITypeValueWithChild[]>([]);

  const deleteMainImage = (index: number) => {
    const updatedImage = productImages.filter(
      (_: any, i: number) => index !== i,
    );

    setProductImages([...updatedImage]);
  };

  const updateVar1TypeItem = (
    index: number,
    newValues: Partial<ITypeValue>,
  ) => {
    setVar1Type((prevVar1Type) => {
      const updatedVar1Type = [...prevVar1Type];
      const newValueForIndex = {
        ...updatedVar1Type[index],
        ...newValues,
      };

      if (newValueForIndex.price && parseInt(newValueForIndex.price) < 1) {
        newValueForIndex.price = "1";
      }
      if (newValueForIndex.stock && parseInt(newValueForIndex.stock) < 0) {
        newValueForIndex.stock = "0";
      }
      if (newValueForIndex.sku && parseInt(newValueForIndex.sku) < 1) {
        newValueForIndex.sku = "1";
      }
      if (newValueForIndex.weight && parseInt(newValueForIndex.weight) < 1) {
        newValueForIndex.weight = "1";
      }

      updatedVar1Type[index] = newValueForIndex;
      return updatedVar1Type;
    });
  };

  const updateVar2TypeItem = (
    index: number,
    newValues: Partial<ITypeValue>,
  ) => {
    setVar2Type((prevVar1Type) => {
      const updatedVar2Type = [...prevVar1Type];
      const newValueForIndex = {
        ...updatedVar2Type[index],
        ...newValues,
      };

      if (newValueForIndex.price && parseInt(newValueForIndex.price) < 1) {
        newValueForIndex.price = "1";
      }
      if (newValueForIndex.stock && parseInt(newValueForIndex.stock) < 0) {
        newValueForIndex.stock = "0";
      }
      if (newValueForIndex.sku && parseInt(newValueForIndex.sku) < 1) {
        newValueForIndex.sku = "1";
      }
      if (newValueForIndex.weight && parseInt(newValueForIndex.weight) < 1) {
        newValueForIndex.weight = "1";
      }

      updatedVar2Type[index] = newValueForIndex;
      return updatedVar2Type;
    });
  };

  const onProductImgAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      if (event.target.files[0]) {
        if (event.target.files[0].size > 512000) {
          toast({
            title: "Image file is to big",
            description: "Max image size is 512kb",
            variant: "destructive",
          });
        } else {
          const file = event.target.files[0];
          setProductImages([...productImages, file]);
        }
      }
    } else {
      return;
    }
  };

  const addNewChildVariant = (value: string) => {
    const trimmedValue = value.trim();

    if (/^[a-zA-Z]+$/.test(trimmedValue)) {
      const lowerCaseValue = trimmedValue.toLowerCase();
      const lowerCasVariants = variantChildSelection.map((variant) =>
        variant.toLowerCase(),
      );

      if (!lowerCasVariants.includes(lowerCaseValue)) {
        setVariantChildSelection([...variantChildSelection, trimmedValue]);
      }
    } else {
      toast({
        title: "Hey Platypals! it can only contain alphabet",
        variant: "destructive",
      });
    }
  };

  const addNewParentVariant = (value: string) => {
    const trimmedValue = value.trim();

    if (/^[a-zA-Z]+$/.test(trimmedValue)) {
      const lowerCaseValue = trimmedValue.toLowerCase();
      const lowerCasVariants = variantParentSelection.map((variant) =>
        variant.toLowerCase(),
      );

      if (!lowerCasVariants.includes(lowerCaseValue)) {
        setVariantParentSelection([...variantParentSelection, trimmedValue]);
      }
    } else {
      toast({
        title: "Hey Platypals! it can only contain alphabet",
        variant: "destructive",
      });
    }
  };

  let addImageElement = [];
  let addImageTypeVariantElement: any = [];

  for (let i = 0; i < 5 - productImages.length; i++) {
    addImageElement.push(
      <div key={`product-images-${i}`}>
        <Label htmlFor={`product-images-${i}`}>
          <div className="border-muted-foregorund relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-lg border-4 border-dotted text-muted-foreground transition-colors duration-500 hover:border-primary hover:text-primary hover:transition-colors hover:duration-500">
            <RiImageAddLine className="h-10 w-10 " />
            {i === 0 && productImages.length === 0 ? (
              <div className="absolute bottom-3">Default image</div>
            ) : (
              <div className="absolute bottom-3">
                Image {i + 1 + productImages.length}
              </div>
            )}
          </div>
        </Label>
        <Input
          size={1}
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => onProductImgAdd(e)}
          id={`product-images-${i}`}
          className="hidden"
          type="file"
          name={`product-images-${i}`}
        />
      </div>,
    );
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      with_parent: false,
      with_child: false,
      title: "",
      category_lv1_id: null,
      category_lv2_id: null,
      category_lv3_id: null,
      description: "",
      video: "",
      price: "",
      stock: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      variant_parents: "",
      variant_childs: "",
    },
  });

  function getCategoryName(categories: ICategory[], categoryId: string) {
    for (const category of categories) {
      if (category.id === categoryId) {
        return category.name;
      }

      if (category.category_lv_2) {
        for (const subCategoryLv2 of category.category_lv_2) {
          if (subCategoryLv2.id === categoryId) {
            return subCategoryLv2.name;
          }

          if (subCategoryLv2.category_lv_3) {
            for (const subCategoryLv3 of subCategoryLv2.category_lv_3) {
              if (subCategoryLv3.id === categoryId) {
                return subCategoryLv3.name;
              }
            }
          }
        }
      }
    }
    return null;
  }

  useEffect(() => {
    const photoUrl = editProductData.photos.map((image) => {
      return image.url;
    });
    setProductImages([...photoUrl]);
    if (!categories) {
      getAllCategory();
    }

    if (
      editProductData.variants.child === null &&
      editProductData.variants.parent.types[0].type === "DEFAULT" &&
      editProductData.variants.parent.group === "DEFAULT"
    ) {
      form.setValue("title", editProductData.title);
      form.setValue("category_lv1_id", editProductData.category_lv1_id);
      form.setValue("category_lv2_id", editProductData.category_lv2_id);
      form.setValue("category_lv3_id", editProductData.category_lv3_id);
      form.setValue("is_used", editProductData.is_used);
      form.setValue("is_hazardous", editProductData.is_hazardous);
      form.setValue("description", editProductData.description);
      form.setValue("video", editProductData.video);
      form.setValue("weight", editProductData.weight);
      form.setValue("length", editProductData.length);
      form.setValue("width", editProductData.width);
      form.setValue("height", editProductData.height);
      form.setValue("price", editProductData.variants.combinations[0].price);
      form.setValue(
        "stock",
        String(editProductData.variants.combinations[0].stock),
      );
    }

    if (
      editProductData.variants.child !== null &&
      editProductData.variants.parent.types[0].type !== "DEFAULT" &&
      editProductData.variants.parent.group !== "DEFAULT"
    ) {
      form.setValue("title", editProductData.title);
      form.setValue("category_lv1_id", editProductData.category_lv1_id);
      form.setValue("category_lv2_id", editProductData.category_lv2_id);
      form.setValue("category_lv3_id", editProductData.category_lv3_id);
      form.setValue("is_used", editProductData.is_used);
      form.setValue("is_hazardous", editProductData.is_hazardous);
      form.setValue("description", editProductData.description);
      form.setValue("video", editProductData.video);
      form.setValue("weight", editProductData.weight);
      form.setValue("length", editProductData.length);
      form.setValue("width", editProductData.width);
      form.setValue("height", editProductData.height);
      form.setValue("price", "100");
      form.setValue("stock", "1");
      addNewChildVariant(editProductData.variants.child.group);
      addNewParentVariant(editProductData.variants.parent.group);
      setVariantParent(true);
      setVariantChild(true);
      form.setValue("variant_parents", editProductData.variants.parent.group);
      form.setValue("variant_childs", editProductData.variants.child.group);
      setVariant1(editProductData.variants.parent.group);
      setVariant2(editProductData.variants.child.group);
      let parType: IVariantType[] = [];
      let parImages: string[] = [];
      editProductData.variants.parent.types.forEach((parent) => {
        const parentType = { id: String(parent.id), text: parent.type };
        parType.push(parentType);
        if (parent.image) {
          parImages.push(parent.image);
        }
      });
      setProductTypeVariantImages([...parImages]);
      let chilType: IVariantType[] = [];
      editProductData.variants.child.types.forEach((child) => {
        const childType = { id: String(child.id), text: child.type };
        chilType.push(childType);
      });

      setParentType([...parType]);
      setChildType([...chilType]);

      let combinationVariant: ITypeValueWithChild[] = [];
      editProductData.variants.combinations.forEach((comb) => {
        const var2Type: ITypeValueWithChild = {
          parentType: comb.parent_type.type,
          childType: comb.child_type?.type,
          type: comb.child_type?.type,
          price: comb.price,
          stock: String(comb.stock as number),
          sku: "",
          weight: "",
          status: true,
          picture: comb.parent_type.image,
        };
        combinationVariant.push(var2Type);
      });
      setVar2Type([...combinationVariant]);
    }

    if (
      editProductData.variants.child === null &&
      editProductData.variants.parent.types[0].type !== "DEFAULT" &&
      editProductData.variants.parent.group !== "DEFAULT"
    ) {
      form.setValue("title", editProductData.title);
      form.setValue("category_lv1_id", editProductData.category_lv1_id);
      form.setValue("category_lv2_id", editProductData.category_lv2_id);
      form.setValue("category_lv3_id", editProductData.category_lv3_id);
      form.setValue("is_used", editProductData.is_used);
      form.setValue("is_hazardous", editProductData.is_hazardous);
      form.setValue("description", editProductData.description);
      form.setValue("video", editProductData.video);
      form.setValue("weight", editProductData.weight);
      form.setValue("length", editProductData.length);
      form.setValue("width", editProductData.width);
      form.setValue("height", editProductData.height);
      form.setValue("price", "100");
      form.setValue("stock", "1");
      addNewParentVariant(editProductData.variants.parent.group);
      setVariantParent(true);
      form.setValue("variant_parents", editProductData.variants.parent.group);
      setVariant1(editProductData.variants.parent.group);
      let parType: IVariantType[] = [];
      let parImages: string[] = [];
      editProductData.variants.parent.types.forEach((parent) => {
        const parentType = { id: String(parent.id), text: parent.type };
        parType.push(parentType);
        if (parent.image) {
          parImages.push(parent.image);
        }
      });
      setProductTypeVariantImages([...parImages]);

      setParentType([...parType]);

      let combinationVariant: ITypeValue[] = [];
      editProductData.variants.combinations.forEach((comb) => {
        const var1Type: ITypeValue = {
          groupName: comb.parent_type.type,
          type: comb.parent_type.type,
          price: comb.price,
          stock: String(comb.stock as number),
          sku: "",
          weight: "",
          status: true,
          picture: comb.parent_type.image,
        };
        combinationVariant.push(var1Type);
      });
      setVar1Type([...combinationVariant]);
    }

    // setProductImages([...editProductData.photos.]);
  }, []);

  for (let i = 0; i < editProductData.variants.parent.types.length; i++) {
    editProductData.variants.parent.types[i].image &&
      addImageTypeVariantElement.push(
        <div
          key={`prod-image-chosen-${i}`}
          className="min-h-32 min-w-32 relative"
        >
          <div className="relative flex cursor-pointer items-center justify-center rounded-lg border-4 border-primary p-1 ">
            <Image
              alt={`prod-image-chosen-${i}`}
              src={editProductData.variants.parent.types[i].image as string}
              className="h-32 w-32 rounded-lg object-cover"
              width={100}
              height={100}
            />
          </div>
          <p className="absolute top-0 rounded-sm bg-primary px-2 py-1 text-xs text-white">
            {editProductData.variants.parent.types[i].type}
          </p>
        </div>,
      );
  }

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();

    if (varianParent && varianChild) {
      const imagesUrl = await Promise.all(
        (productImages || []).map(async (photo) => {
          const postImg =
            photo instanceof File
              ? await cloudinaryUpload(photo as File)
              : (photo as string);
          return postImg;
        }),
      );

      const imagesUrlVariant = await Promise.all(
        (productTypeVariantImages || []).map(async (photo) => {
          const postImg =
            photo instanceof File
              ? await cloudinaryUpload(photo as File)
              : (photo as string);
          return postImg;
        }),
      );

      const fullPayload = {
        ...submitData,
        photos: imagesUrl,
      };

      const variantParentPayload = {
        id: editProductData.variants.parent.id,
        group: variant1,
        types: parentType.map((type, i) => {
          if (imagesUrlVariant[i]) {
            return {
              id: editProductData.variants.parent.types[i].id,
              type: type.text,
              image: imagesUrlVariant[i],
            };
          }
          return { type: type.text };
        }),
      };

      const variantChildPayload = {
        id: editProductData.variants.child?.id,
        group: variant2,
        types: childType.map((type, i) => {
          return {
            id: editProductData.variants.child?.types[i].id,
            type: type.text,
          };
        }),
      };

      const combinationVariantsPayload = var2Type.map((type, i) => {
        if (editProductData.variants.combinations[i].parent_type.image) {
          return {
            id: editProductData.variants.combinations[i].id,
            parent_type: {
              id: editProductData.variants.combinations[i].parent_type.id,
              type: type.parentType,
              image: editProductData.variants.combinations[i].parent_type.image,
            },
            child_type: {
              id: editProductData.variants.combinations[i].child_type?.id,
              type: type.type,
            },
            price: type.price,
            stock: parseInt(type.stock as string),
          };
        }
        return {
          id: editProductData.variants.combinations[i].id,
          parent_type: {
            id: editProductData.variants.combinations[i].parent_type.id,
            type: type.parentType,
          },
          child_type: {
            id: editProductData.variants.combinations[i].child_type?.id,
            type: type.type,
          },
          price: type.price,
          stock: parseInt(type.stock as string),
        };
      });

      const photosFormat = fullPayload.photos.map((photo, i) => {
        return {
          url: photo,
          is_default: i === 0 ? true : false,
        };
      });

      const convertedParentChildVariantPayload = {
        id: editProductData.id,
        title: fullPayload.title,
        photos: photosFormat,
        video: fullPayload.video,
        description: fullPayload.description,
        length: fullPayload.length,
        width: fullPayload.width,
        height: fullPayload.height,
        weight: fullPayload.weight,
        is_used: fullPayload.is_used,
        is_hazardous: fullPayload.is_hazardous,
        category_lv1_id: fullPayload.category_lv1_id,
        category_lv2_id: fullPayload.category_lv2_id,
        category_lv3_id: fullPayload.category_lv3_id,
        variants: {
          parent: variantParentPayload,
          child: variantChildPayload,
          combinations: combinationVariantsPayload,
        },
      };

      const { error }: IResponseApi<any> = await service.putUpdateProduct(
        convertedParentChildVariantPayload,
        editProductData.id,
      );

      if (error) {
        toast({ title: "Faill to add", variant: "destructive" });
        hideLoadingSm();
      } else {
        toast({ title: "Product Updated", variant: "success" });
        router.push("/merchant-center/my-products");
        hideLoadingSm();
      }
    }

    if (varianParent && !varianChild) {
      const imagesUrl = await Promise.all(
        (productImages || []).map(async (photo) => {
          const postImg =
            photo instanceof File
              ? await cloudinaryUpload(photo as File)
              : (photo as string);
          return postImg;
        }),
      );

      const imagesUrlVariant = await Promise.all(
        (productTypeVariantImages || []).map(async (photo) => {
          const postImg =
            photo instanceof File
              ? await cloudinaryUpload(photo as File)
              : (photo as string);
          return postImg;
        }),
      );

      const fullPayload = {
        ...submitData,
        photos: imagesUrl,
      };

      const variantParentPayload = {
        id: editProductData.variants.parent.id,
        group: variant1,
        types: parentType.map((type, i) => {
          if (imagesUrlVariant[i]) {
            return {
              id: editProductData.variants.parent.types[i].id,
              type: type.text,
              image: imagesUrlVariant[i],
            };
          }
          return { type: type.text };
        }),
      };

      const combinationVariantsPayload = var1Type.map((type, i) => {
        if (editProductData.variants.combinations[i].parent_type.image) {
          return {
            id: editProductData.variants.combinations[i].id,
            parent_type: {
              id: editProductData.variants.combinations[i].parent_type.id,
              type: type.type,
              image: editProductData.variants.combinations[i].parent_type.image,
            },
            child_type: null,
            price: type.price,
            stock: parseInt(type.stock as string),
          };
        }
        return {
          id: editProductData.variants.combinations[i].id,
          parent_type: {
            id: editProductData.variants.combinations[i].parent_type.id,
            type: type.type,
          },
          child_type: null,
          price: type.price,
          stock: parseInt(type.stock as string),
        };
      });

      const photosFormat = fullPayload.photos.map((photo, i) => {
        return {
          url: photo,
          is_default: i === 0 ? true : false,
        };
      });

      const convertedParentVariantPayload = {
        id: editProductData.id,
        title: fullPayload.title,
        photos: photosFormat,
        video: fullPayload.video,
        description: fullPayload.description,
        length: fullPayload.length,
        width: fullPayload.width,
        height: fullPayload.height,
        weight: fullPayload.weight,
        is_used: fullPayload.is_used,
        is_hazardous: fullPayload.is_hazardous,
        category_lv1_id: fullPayload.category_lv1_id,
        category_lv2_id: fullPayload.category_lv2_id,
        category_lv3_id: fullPayload.category_lv3_id,
        variants: {
          parent: variantParentPayload,
          child: null,
          combinations: combinationVariantsPayload,
        },
      };

      const { error }: IResponseApi<any> = await service.putUpdateProduct(
        convertedParentVariantPayload,
        editProductData.id,
      );

      if (error) {
        toast({ title: "Fail to add", variant: "destructive" });
        hideLoadingSm();
      } else {
        toast({ title: "Product Updated", variant: "success" });
        router.push("/merchant-center/my-products");
        hideLoadingSm();
      }
      // hideLoadingSm();

      // hideLoadingSm();
    }

    if (!varianParent && !varianChild) {
      const postSingleProduct = async () => {
        const imagesUrl = await Promise.all(
          (productImages || []).map(async (photo) => {
            const postImg =
              photo instanceof File
                ? await cloudinaryUpload(photo as File)
                : (photo as string);
            return postImg;
          }),
        );

        const fullPayload = {
          ...submitData,
          photos: imagesUrl,
        };

        const photosFormat = fullPayload.photos.map((photo, i) => {
          return {
            url: photo,
            is_default: i === 0 ? true : false,
          };
        });

        const convertedSinglePayload = {
          id: editProductData.id,
          title: fullPayload.title,
          photos: photosFormat,
          video: fullPayload.video,
          description: fullPayload.description,
          length: fullPayload.length,
          width: fullPayload.width,
          height: fullPayload.height,
          weight: fullPayload.weight,
          is_used: fullPayload.is_used,
          is_hazardous: fullPayload.is_hazardous,
          category_lv1_id: fullPayload.category_lv1_id,
          category_lv2_id: fullPayload.category_lv2_id,
          category_lv3_id: fullPayload.category_lv3_id,
          variants: {
            parent: {
              id: editProductData.variants.parent.id,
              group: "DEFAULT",
              types: [
                {
                  id: editProductData.variants.parent.types[0].id,
                  type: "DEFAULT",
                },
              ],
            },
            child: null,
            combinations: [
              {
                id: editProductData.variants.combinations[0].id,
                parent_type: {
                  id: editProductData.variants.combinations[0].parent_type.id,
                  type: "DEFAULT",
                },
                child_type: null,
                price: fullPayload.price,
                stock: parseInt(fullPayload.stock),
              },
            ],
          },
        };

        const { error }: IResponseApi<any> = await service.putUpdateProduct(
          convertedSinglePayload,
          editProductData.id,
        );

        if (error) {
          toast({ title: "Faill to update", variant: "destructive" });
          hideLoadingSm();
        } else {
          toast({ title: "Product Updated", variant: "success" });
          router.push("/merchant-center/my-products");

          hideLoadingSm();
        }
        // hideLoadingSm();
      };
      postSingleProduct();
    }
  }

  if (!categories) {
    return null;
  }

  return (
    <div id="new-product-form" className="mb-20 mt-10 max-lg:mt-40">
      <h2 className="mb-5 text-4xl font-bold text-primary">Edit Product</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="w-full space-y-10 rounded-lg border-[1px] border-border bg-background p-10 shadow-md">
            <p className="text-lg font-bold text-primary">
              Product Informations
            </p>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithDescription
                      disabled
                      formLabel="Product Title"
                      placeholder="Exp: Woman sweater"
                      description={
                        <div className="space-y-3">
                          <p>
                            Product Informations Add your product name min 10
                            character long and 70 character max
                          </p>
                          <p>
                            Remember that{" "}
                            <span className="font-bold text-secondary-foreground">
                              {`product title can't be change`}
                            </span>{" "}
                            after submitted
                          </p>
                        </div>
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <p>{form.getValues("category_lv1_id")}</p>
            <p>{form.getValues("category_lv2_id")}</p>
            <p>{form.getValues("category_lv3_id")}</p> */}
            <FormField
              control={form.control}
              name="category_lv1_id"
              render={() => (
                <FormItem>
                  <UniInputDescription
                    formLabel="Select Categories"
                    description="Choose your product category, it will up to 3 level"
                  >
                    <div className="relative">
                      <div
                        className="flex h-9
                         w-full items-center  space-x-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <p>
                          {getCategoryName(
                            categories,
                            editProductData.category_lv1_id,
                          )}
                        </p>
                        {editProductData.category_lv2_id && (
                          <MdKeyboardArrowRight />
                        )}
                        <p>
                          {editProductData.category_lv2_id &&
                            getCategoryName(
                              categories,
                              editProductData.category_lv2_id,
                            )}
                        </p>
                        {editProductData.category_lv3_id && (
                          <MdKeyboardArrowRight />
                        )}
                        <p>
                          {editProductData.category_lv3_id &&
                            getCategoryName(
                              categories,
                              editProductData.category_lv3_id,
                            )}
                        </p>
                      </div>
                    </div>
                  </UniInputDescription>
                </FormItem>
              )}
            />
          </div>
          <div className="w-full space-y-10 rounded-lg border-[1px] border-border bg-background p-10 shadow-md">
            <p className="text-lg font-bold text-primary">Product Details</p>

            <UniInputDescription
              formLabel="Product Images"
              description="Image format .jpg .jpeg .png"
              className="flex flex-wrap gap-3"
            >
              {productImages.map((image, i) => (
                <div
                  key={`prod-image-${image}`}
                  className="min-h-32 min-w-32 relative"
                >
                  <div className="group relative flex items-center justify-center rounded-lg border-4 border-primary p-1 ">
                    <div
                      onClick={() => deleteMainImage(i)}
                      className="absolute bottom-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white opacity-0 transition-opacity group-hover:opacity-100 group-hover:transition-opacity"
                    >
                      <FaRegTrashCan className="h-5 w-5" />
                    </div>
                    <Image
                      alt={`prod-image-${image}`}
                      src={
                        image instanceof File
                          ? URL.createObjectURL(image as File)
                          : (image as string)
                      }
                      className="h-32 w-32 rounded-lg object-cover"
                      width={100}
                      height={100}
                    />
                  </div>
                  {i === 0 && (
                    <p className="absolute top-0 rounded-sm bg-primary px-2 py-1 text-xs text-white">
                      Main Image
                    </p>
                  )}
                </div>
              ))}
              {addImageElement}
            </UniInputDescription>
            <FormField
              control={form.control}
              name="is_used"
              render={({ field }) => (
                <UniInputDescription formLabel="Condition">
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(e) => {
                          if (e === "false") {
                            field.onChange(false);
                          } else {
                            field.onChange(true);
                          }
                        }}
                        className="flex items-center gap-5"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              checked={form.getValues("is_used") === false}
                              className="h-7 w-7"
                              value="false"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">New</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              checked={form.getValues("is_used") === true}
                              className="h-7 w-7"
                              value="true"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Used</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </UniInputDescription>
              )}
            />
            <FormField
              control={form.control}
              name="is_hazardous"
              render={({ field }) => (
                <UniInputDescription formLabel="Does the product hazardous?">
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(e) => {
                          if (e === "false") {
                            field.onChange(false);
                          } else {
                            field.onChange(true);
                          }
                        }}
                        className="flex items-center gap-5"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              checked={form.getValues("is_hazardous") === false}
                              className="h-7 w-7"
                              value="false"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Not hazardous
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              checked={form.getValues("is_hazardous") === true}
                              className="h-7 w-7"
                              value="true"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Yes. Hazardous
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </UniInputDescription>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <UniInputDescription
                      formLabel="Product Description"
                      description="Make sure the product description contains a detailed explanation regarding your product so that buyers can easily understand and find your product."
                    >
                      <Textarea
                        placeholder="Your product description"
                        className="h-40 resize-none"
                        {...field}
                      />
                    </UniInputDescription>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithDescription
                      formLabel="Youtube Video"
                      placeholder="Exp: www.youtube.com/watch?xxxx"
                      description={
                        <div className="space-y-3">
                          <p>
                            Product Informations Add your product name min 10
                            character long and 70 character max
                          </p>
                          <p>
                            Remember that{" "}
                            <span className="font-bold text-secondary-foreground">
                              {`product title can't be change`}
                            </span>{" "}
                            after submitted
                          </p>
                        </div>
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/*No Variant*/}
          {!varianParent && (
            <div className="space-y-5">
              <div className="w-full space-y-10 rounded-lg border-[1px] border-border bg-background p-10 shadow-md">
                <p className="text-lg font-bold text-primary">Price & Stock</p>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputWithDescription
                          formLabel="Unit Price"
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-", "."].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          type="number"
                          placeholder="Enter the product price"
                          icon={"Rp"}
                          description={"Enter your price product per unit"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputWithDescription
                          formLabel="Stock"
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-", "."].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          type="number"
                          placeholder="Enter the product stock"
                          description={"Enter your total product stock"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full space-y-10 rounded-lg border-[1px] border-border bg-background p-10 shadow-md">
                <p className="text-lg font-bold text-primary">
                  Shipping & Weight
                </p>
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputWithDescription
                          formLabel="Weight"
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-", "."].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          type="number"
                          placeholder="Weight"
                          description={"Enter your total product weight"}
                          icon="gram"
                          className="w-fit"
                          iconEnd
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <UniInputDescription
                  formLabel="Product Size"
                  description="Enter your product size include box"
                >
                  <div className="flex flex-wrap gap-3">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputPrimeIcon
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-", "."].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              type="number"
                              placeholder="Length"
                              icon="cm"
                              className="w-fit"
                              iconEnd
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputPrimeIcon
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-", "."].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              type="number"
                              placeholder="Width"
                              icon="cm"
                              className="w-fit"
                              iconEnd
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputPrimeIcon
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-", "."].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              type="number"
                              placeholder="Height"
                              icon="cm"
                              className="w-fit"
                              iconEnd
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </UniInputDescription>
              </div>
            </div>
          )}
          {/*With Parent Variant*/}
          {varianParent && (
            <div className="w-full space-y-10 rounded-lg border-[1px] border-border bg-background p-10 shadow-md">
              <UniInputDescription
                formLabel={
                  <FormField
                    control={form.control}
                    name="variant_parents"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Variant Group 1</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled
                                onClick={() => setNewVarparent("")}
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? variantParentSelection.find(
                                      (language) => language === field.value,
                                    )
                                  : "Select Variant"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput
                                value={newVarParent}
                                placeholder="Search or Add variant"
                                className="h-9"
                              />
                              <CommandEmpty>
                                <p>No variant found</p>
                                <p>
                                  Press{" "}
                                  <span className="font-bold text-primary">
                                    Enter
                                  </span>{" "}
                                  to add new
                                </p>
                              </CommandEmpty>
                              <CommandGroup>
                                {variantParentSelection.map((variant) => (
                                  <CommandItem value={variant} key={variant}>
                                    {variant}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        variant === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {`You can't edit variant group`}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                }
              >
                <ReactTags
                  readOnly={true}
                  classNames={{
                    tagInputField:
                      "flex h-9 px-3 mt-2 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    tag: "mr-1 bg-primary text-white px-2 py-1 rounded-md",
                    remove: "ml-2",
                  }}
                  allowDeleteFromEmptyInput={false}
                  placeholder="Please press enter to add new variant type"
                  tags={parentType}
                  delimiters={delimiters}
                  handleDelete={() => {}}
                  handleAddition={() => {}}
                  allowDragDrop={false}
                  inputFieldPosition="bottom"
                  autocomplete
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  {addImageTypeVariantElement}
                </div>
              </UniInputDescription>
              <UniInputDescription
                formLabel={
                  varianChild ? (
                    <FormField
                      control={form.control}
                      name="variant_childs"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Variant Group 2</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  disabled
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-[200px] justify-between",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value
                                    ? variantChildSelection.find(
                                        (child) => child === field.value,
                                      )
                                    : "Select Variant"}
                                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search or Add variant"
                                  className="h-9"
                                />
                                <CommandEmpty>
                                  <p>No variant found</p>
                                  <p>
                                    Press{" "}
                                    <span className="font-bold text-primary">
                                      Enter
                                    </span>{" "}
                                    to add new
                                  </p>
                                </CommandEmpty>
                                <CommandGroup>
                                  {variantChildSelection.map((variantChild) => (
                                    <CommandItem
                                      value={variantChild}
                                      key={variantChild}
                                    >
                                      {variantChild}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          variantChild === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null
                }
              >
                <div className="flex w-full items-center gap-3">
                  <ReactTags
                    readOnly={true}
                    classNames={{
                      tags: "w-full",
                      tagInputField:
                        "flex h-9 px-3 mt-2 w-full rounded-md border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      tag: "mr-1 bg-primary text-white px-2 py-1 rounded-md",
                      remove: "ml-2",
                    }}
                    allowDeleteFromEmptyInput={false}
                    placeholder="Please press enter to add new variant type"
                    tags={childType}
                    delimiters={delimiters}
                    handleDelete={() => {}}
                    handleAddition={() => {}}
                    allowDragDrop={false}
                    inputFieldPosition="bottom"
                    autocomplete
                  />
                </div>
              </UniInputDescription>
              <div>
                <p className="font-bold text-primary">Variant Table</p>
                <VariantTable
                  stockZero
                  updateVar1TypeItem={updateVar1TypeItem}
                  updateVar2TypeItem={updateVar2TypeItem}
                  var1Type={var1Type}
                  var2Type={var2Type}
                  parent={variant1}
                  child={variant2}
                  parentType={parentType}
                  childType={childType}
                  varianChild={varianChild}
                />
              </div>
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputWithDescription
                        formLabel="Weight"
                        onKeyDown={(evt) =>
                          ["e", "E", "+", "-", "."].includes(evt.key) &&
                          evt.preventDefault()
                        }
                        type="number"
                        placeholder="Weight"
                        description={"Enter your total product weight"}
                        icon="gram"
                        className="w-fit"
                        iconEnd
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <UniInputDescription
                formLabel="Product Size"
                description="Enter your product size include box"
              >
                <div className="flex flex-wrap gap-3">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputPrimeIcon
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-", "."].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            type="number"
                            placeholder="Length"
                            icon="cm"
                            className="w-fit"
                            iconEnd
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputPrimeIcon
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-", "."].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            type="number"
                            placeholder="Width"
                            icon="cm"
                            className="w-fit"
                            iconEnd
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputPrimeIcon
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-", "."].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            type="number"
                            placeholder="Height"
                            icon="cm"
                            className="w-fit"
                            iconEnd
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </UniInputDescription>
            </div>
          )}
          {varianParent && varianChild && (
            <ButtonWithLoading
              disabled={
                productImages.length === 0 ||
                variant1 === "" ||
                parentType.length === 0 ||
                var2Type.some(
                  (item) =>
                    item.price === "" ||
                    item.stock === "" ||
                    parseInt(item.price as string) < 100 ||
                    parseInt(item.price as string) > 100000000000000 ||
                    parseInt(item.stock as string) < 0 ||
                    parseInt(item.stock as string) > 100000,
                )
              }
              className="w-full"
              type="submit"
              name="submit-add-product"
              buttonContent="Save With Variant Child"
              loadingContent="Adding Product..."
            />
          )}
          {varianParent && !varianChild && (
            <ButtonWithLoading
              disabled={
                productImages.length === 0 ||
                productImages.length === 0 ||
                variant1 === "" ||
                parentType.length === 0 ||
                var1Type.some(
                  (item) =>
                    item.price === "" ||
                    item.stock === "" ||
                    parseInt(item.price as string) < 100 ||
                    parseInt(item.price as string) > 100000000000000 ||
                    parseInt(item.stock as string) < 0 ||
                    parseInt(item.stock as string) > 100000,
                )
              }
              className="w-full"
              type="submit"
              name="submit-add-product"
              buttonContent="Save With Variant"
              loadingContent="Adding Product..."
            />
          )}
          {!varianParent && (
            <ButtonWithLoading
              disabled={productImages.length === 0}
              className="w-full"
              type="submit"
              name="submit-add-product"
              buttonContent="Save"
              loadingContent="Adding Product..."
            />
          )}
        </form>
      </Form>
    </div>
  );
}
