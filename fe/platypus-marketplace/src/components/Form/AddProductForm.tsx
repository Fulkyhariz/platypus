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
import { IoAddCircleOutline } from "react-icons/io5";
import { InputWithDescription } from "../Input/InputWithDescription";
import UniInputDescription from "../Input/UniInputDescription";
import { useProducts } from "@/store/products/useProducts";
import SelectionButton from "../Button/SelectionButton";
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
import { useModal } from "@/store/modal/useModal";
import RemoveVariant from "../AddProduct/RemoveVariant";
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
import RemoveChildVariant from "../AddProduct/RemoveChildVariant";
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
    // courier: z.array(z.string()).refine((value) => value.some((item) => item), {
    //   message: "You have to select at least one courier.",
    // }),
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

export function AddProductForm() {
  const router = useRouter();
  const [catIdxLv1, setcatIdxLv1] = useState<number>(-1);
  const [catIdxLv2, setcatIdxLv2] = useState<number>(-1);
  const [catIdxLv3, setcatIdxLv3] = useState<number>(-1);
  const [showCategories, setShowCategories] = useState<boolean>(false);
  const [productImages, setProductImages] = useState<(File | string)[]>([]);
  const [useVariantImage, setUseVariantImage] = useState<boolean>(false);
  const [productTypeVariantImages, setProductTypeVariantImages] = useState<
    (File | string)[]
  >([]);
  const [varianParent, setVariantParent] = useState<boolean>(false);
  const [varianChild, setVariantChild] = useState<boolean>(false);
  const [newVarParent, setNewVarparent] = useState<string>("");
  const [newVarChild, setNewVarChild] = useState<string>("");
  const [variant1, setVariant1] = useState<string>("");
  const [variant2, setVariant2] = useState<string>("");
  const { getAllCategory } = useProducts.getState();
  const { showModal } = useModal.getState();
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

  useEffect(() => {
    const newVar2Type = parentType.flatMap((parent) =>
      childType.map((child) => ({
        parentType: parent.text,
        childType: child.text,
        type: child.text,
        price: "",
        stock: "",
        sku: "",
        weight: "",
        status: true,
        picture: "",
      })),
    );

    setVar2Type(newVar2Type);
  }, [parentType, childType]);

  const deleteMainImage = (index: number) => {
    const updatedImage = productImages.filter(
      (_: any, i: number) => index !== i,
    );

    setProductImages([...updatedImage]);
  };

  const handleDeleteType = (i: any) => {
    setParentType(parentType.filter((_: any, index: any) => index !== i));
    setVar1Type(var1Type.filter((_: any, index: any) => index !== i));
    setProductTypeVariantImages(
      productTypeVariantImages.filter((_: any, index: any) => index !== i),
    );
  };
  const handleDeleteType2 = (i: any) => {
    setChildType(childType.filter((_: any, index: any) => index !== i));
    setVar2Type(
      var2Type.filter(
        (type: ITypeValueWithChild) => type.childType !== var2Type[i].childType,
      ),
    );
  };

  const handleAdditionType = (tag: IVariantType) => {
    setParentType([...parentType, tag]);
    setVar1Type([
      ...var1Type,
      {
        groupName: variant1,
        type: tag.text,
        price: "",
        stock: "",
        sku: "",
        weight: "",
        status: true,
        picture: "",
      },
    ]);
  };

  const handleAdditionType2 = (tag: IVariantType) => {
    setChildType((prevChildType) => [...prevChildType, tag]);
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

  const onProductImgTypeAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          setProductTypeVariantImages([...productTypeVariantImages, file]);
        }
      }
    } else {
      return;
    }
  };

  const onKeyDownVarParent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addNewParentVariant(newVarParent);
    }
  };
  const onKeyDownVarChild = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addNewChildVariant(newVarChild);
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
      } else {
        toast({
          title: `Since variant ${value} exist, it will be selected`,
          variant: "success",
        });
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
      } else {
        toast({
          title: `Since variant ${value} exist, it will be selected`,
          variant: "success",
        });
      }
    } else {
      toast({
        title: "Hey Platypals! it can only contain alphabet",
        variant: "destructive",
      });
    }
  };

  let addImageElement = [];
  let addImageTypeVariantElement = [];

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
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={(e) => onProductImgAdd(e)}
          id={`product-images-${i}`}
          className="hidden"
          type="file"
          name={`product-images-${i}`}
        />
      </div>,
    );
  }

  for (let i = 0; i < var1Type.length; i++) {
    {
      productTypeVariantImages[i] &&
        addImageTypeVariantElement.push(
          <div
            key={`prod-image-chosen-${i}`}
            className="min-h-32 min-w-32 relative"
          >
            <div className="relative flex cursor-pointer items-center justify-center rounded-lg border-4 border-primary p-1 ">
              <Image
                alt={`prod-image-chosen-${i}`}
                src={
                  productTypeVariantImages[i] instanceof File
                    ? URL.createObjectURL(productTypeVariantImages[i] as File)
                    : (productTypeVariantImages[i] as string)
                }
                className="h-32 w-32 rounded-lg object-cover"
                width={100}
                height={100}
              />
            </div>
            <p className="absolute top-0 rounded-sm bg-primary px-2 py-1 text-xs text-white">
              {var1Type[i].type}
            </p>
          </div>,
        );
    }
    {
      var1Type[i] &&
        !productTypeVariantImages[i] &&
        addImageTypeVariantElement.push(
          <div key={`product-images-type-${i}`}>
            <Label htmlFor={`product-images-type-${i}`}>
              <div
                className={` ${
                  i > productTypeVariantImages.length
                    ? ""
                    : "cursor-pointer transition-colors duration-500 hover:border-primary hover:text-primary hover:transition-colors hover:duration-500"
                } border-muted-foregorund relative flex h-36 w-36  items-center justify-center rounded-lg border-4 border-dotted text-muted-foreground `}
              >
                {i > productTypeVariantImages.length ? null : (
                  <IoAddCircleOutline className="h-10 w-10 " />
                )}
                <div className="absolute bottom-3">Image type {i + 1}</div>
              </div>
            </Label>
            <Input
              size={1}
              disabled={i > productTypeVariantImages.length}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => onProductImgTypeAdd(e)}
              id={`product-images-type-${i}`}
              className="hidden"
              type="file"
              name={`product-images-type-${i}`}
            />
          </div>,
        );
    }
  }

  const getCategories = () => {
    if (!categories) {
      getAllCategory();
    }
    setShowCategories(true);
  };

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
      // courier: [],
      variant_parents: "",
      variant_childs: "",
    },
  });

  const onRemoveVariant = () => {
    setVariantParent(false);
    setVariantChild(false);
    setNewVarparent("");
    setNewVarChild("");
    setVariant1("");
    setVariant2("");
    setParentType([]);
    setChildType([]);
    setVar1Type([]);
    setVar2Type([]);
    setUseVariantImage(false);
    setProductTypeVariantImages([]);
    form.setValue("variant_parents", "");
    form.setValue("variant_childs", "");
    form.setValue("price", "");
    // form.setValue("weight", "");
    form.setValue("stock", "");
  };

  const onRemoveVariantChild = () => {
    setVariantChild(false);
    setNewVarChild("");
    setVariant2("");
    setChildType([]);
    setVar2Type([]);
    form.setValue("variant_childs", "");
    // form.setValue("weight", "");
  };

  async function onSubmit(submitData: z.infer<typeof FormSchema>) {
    showLoadingSm();

    if (varianParent && varianChild) {
      const imagesUrl = await Promise.all(
        (productImages || []).map(async (photo) => {
          const postImg = await cloudinaryUpload(photo as File);
          return postImg;
        }),
      );

      const imagesUrlVariant = await Promise.all(
        (productTypeVariantImages || []).map(async (photo) => {
          const postImg = await cloudinaryUpload(photo as File);
          return postImg;
        }),
      );

      const fullPayload = {
        ...submitData,
        photos: imagesUrl,
      };

      const variantParentPayload = {
        group: variant1,
        types: parentType.map((type, i) => {
          if (imagesUrlVariant[i]) {
            return { type: type.text, image: imagesUrlVariant[i] };
          }
          return { type: type.text };
        }),
      };

      const variantChildPayload = {
        group: variant2,
        types: childType.map((type) => {
          return { type: type.text };
        }),
      };

      const combinationVariantsPayload = var2Type.map((type) => {
        return {
          parent_type: { type: type.parentType },
          child_type: { type: type.type },
          price: type.price,
          stock: parseInt(type.stock as string),
        };
      });

      const photosFormat = fullPayload.photos.map((photo, i) => {
        return { url: photo, is_default: i === 0 ? true : false };
      });

      const convertedSinglePayload = {
        title: fullPayload.title,
        photos: photosFormat,
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
        // couriers: courierFormat,
      };

      const { error }: IResponseApi<any> = await service.postNewProduct(
        convertedSinglePayload,
      );

      if (error) {
        toast({ title: "Faill to add", variant: "destructive" });
        hideLoadingSm();
      } else {
        toast({ title: "Product added", variant: "success" });
        router.push("/merchant-center/my-products");
        hideLoadingSm();
      }
    }

    if (varianParent && !varianChild) {
      const imagesUrl = await Promise.all(
        (productImages || []).map(async (photo) => {
          const postImg = await cloudinaryUpload(photo as File);
          return postImg;
        }),
      );

      const imagesUrlVariant = await Promise.all(
        (productTypeVariantImages || []).map(async (photo) => {
          const postImg = await cloudinaryUpload(photo as File);
          return postImg;
        }),
      );

      const fullPayload = {
        ...submitData,
        photos: imagesUrl,
      };

      const variantParentPayload = {
        group: variant1,
        types: parentType.map((type, i) => {
          if (imagesUrlVariant[i]) {
            return { type: type.text, image: imagesUrlVariant[i] };
          }
          return { type: type.text };
        }),
      };

      const combinationVariantsPayload = var1Type.map((type) => {
        return {
          parent_type: { type: type.type },
          child_type: null,
          price: type.price,
          stock: parseInt(type.stock as string),
        };
      });

      const photosFormat = fullPayload.photos.map((photo, i) => {
        return { url: photo, is_default: i === 0 ? true : false };
      });

      const convertedSinglePayload = {
        title: fullPayload.title,
        photos: photosFormat,
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
        // couriers: courierFormat,
      };

      const { error }: IResponseApi<any> = await service.postNewProduct(
        convertedSinglePayload,
      );

      if (error) {
        toast({ title: "Faill to add", variant: "destructive" });
        hideLoadingSm();
      } else {
        toast({ title: "Product added", variant: "success" });
        router.push("/merchant-center/my-products");

        hideLoadingSm();
      }

      // hideLoadingSm();
    }

    if (!varianParent) {
      const postSingleProduct = async () => {
        const imagesUrl = await Promise.all(
          (productImages || []).map(async (photo) => {
            const postImg = await cloudinaryUpload(photo as File);
            return postImg;
          }),
        );

        const fullPayload = {
          ...submitData,
          photos: imagesUrl,
        };
        const photosFormat = fullPayload.photos.map((photo, i) => {
          return { url: photo, is_default: i === 0 ? true : false };
        });
        // const courierFormat = fullPayload.courier.map((cour) => {
        //   return { name: cour };
        // });

        const convertedSinglePayload = {
          title: fullPayload.title,
          photos: photosFormat,
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
              group: "DEFAULT",
              types: [
                {
                  type: "DEFAULT",
                },
              ],
            },
            child: null,
            combinations: [
              {
                parent_type: {
                  type: "DEFAULT",
                },
                child_type: null,
                price: fullPayload.price,
                stock: parseInt(fullPayload.stock),
              },
            ],
          },
          // couriers: courierFormat,
        };

        const { error }: IResponseApi<any> = await service.postNewProduct(
          convertedSinglePayload,
        );

        if (error) {
          toast({ title: "Faill to add", variant: "destructive" });
          hideLoadingSm();
        } else {
          toast({ title: "Product added", variant: "success" });
          router.push("/merchant-center/my-products");

          hideLoadingSm();
        }
      };
      postSingleProduct();
    }
  }

  return (
    <div id="new-product-form" className="mb-20 mt-10 max-lg:mt-40">
      <h2 className="mb-5 text-4xl font-bold text-primary">Add New Product</h2>
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
              render={({ field }) => (
                <FormItem>
                  <UniInputDescription
                    formLabel="Select Categories"
                    description="Choose your product category, it will up to 3 level"
                  >
                    <div className="relative">
                      {catIdxLv1 < 0 ? (
                        <p
                          className="
                        flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Select category
                        </p>
                      ) : (
                        <div
                          className="flex h-9
                         w-full items-center  space-x-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <p>
                            {catIdxLv1 >= 0 &&
                              categories &&
                              categories[catIdxLv1].name}
                          </p>
                          {catIdxLv2 >= 0 && categories && (
                            <MdKeyboardArrowRight />
                          )}
                          <p>
                            {catIdxLv2 >= 0 &&
                              categories &&
                              categories[catIdxLv1].category_lv_2[catIdxLv2]
                                .name}
                          </p>
                          {catIdxLv3 >= 0 && categories && (
                            <MdKeyboardArrowRight />
                          )}
                          <p>
                            {catIdxLv3 >= 0 &&
                              categories &&
                              categories[catIdxLv1].category_lv_2[catIdxLv2]
                                .category_lv_3[catIdxLv3].name}
                          </p>
                        </div>
                      )}
                      {!showCategories && (
                        <Button
                          className="absolute right-0 top-0"
                          type="button"
                          onClick={() => {
                            getCategories();
                          }}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                    {showCategories &&
                      (categories ? (
                        <div className="flex h-[18.5rem] border-[1px] border-border">
                          <div className="flex h-full flex-1 flex-col overflow-y-scroll">
                            {categories.map((category, i) => (
                              <FormControl key={category.id}>
                                <SelectionButton
                                  onClick={() => {
                                    field.onChange(category.id);
                                    setcatIdxLv1(i);
                                    setcatIdxLv2(-1);
                                    setcatIdxLv3(-1);
                                    form.setValue("category_lv2_id", null);
                                    form.setValue("category_lv3_id", null);

                                    if (!category.category_lv_2) {
                                      setcatIdxLv2(-1);
                                      setShowCategories(false);
                                    }
                                  }}
                                  type="button"
                                >
                                  <p className=" line-clamp-1 text-left">
                                    {category.name}
                                  </p>
                                  {category.category_lv_2 && (
                                    <div>
                                      <MdKeyboardArrowRight />
                                    </div>
                                  )}
                                  {catIdxLv1 === i && (
                                    <div className="absolute left-0 h-full w-1 animate-quantum_bouncing bg-primary" />
                                  )}
                                </SelectionButton>
                              </FormControl>
                            ))}
                          </div>
                          {catIdxLv1 >= 0 &&
                            categories[catIdxLv1].category_lv_2 && (
                              <div className="flex h-full flex-1 flex-col overflow-y-scroll border-l-[1px] border-border">
                                <FormField
                                  control={form.control}
                                  name="category_lv2_id"
                                  render={({ field }) => (
                                    <FormItem className=" space-y-0">
                                      {categories[catIdxLv1] &&
                                        categories[catIdxLv1].category_lv_2.map(
                                          (category, i) => (
                                            <FormControl key={category.id}>
                                              <SelectionButton
                                                className="w-full"
                                                onClick={() => {
                                                  field.onChange(category.id);
                                                  setcatIdxLv2(i);
                                                  setcatIdxLv3(-1);
                                                  form.setValue(
                                                    "category_lv3_id",
                                                    null,
                                                  );

                                                  if (!category.category_lv_3) {
                                                    setShowCategories(false);
                                                  }
                                                }}
                                                type="button"
                                              >
                                                <p className=" line-clamp-1 text-left">
                                                  {category.name}
                                                </p>
                                                {category.category_lv_3 && (
                                                  <div>
                                                    <MdKeyboardArrowRight />
                                                  </div>
                                                )}
                                                {catIdxLv2 === i && (
                                                  <div className="absolute left-0 h-full w-1 animate-quantum_bouncing bg-primary" />
                                                )}
                                              </SelectionButton>
                                            </FormControl>
                                          ),
                                        )}
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          {catIdxLv1 >= 0 &&
                            catIdxLv2 >= 0 &&
                            categories[catIdxLv1].category_lv_2[catIdxLv2]
                              .category_lv_3 && (
                              <div className="flex h-full flex-1 flex-col overflow-y-scroll border-l-[1px] border-border">
                                <FormField
                                  control={form.control}
                                  name="category_lv3_id"
                                  render={({ field }) => (
                                    <FormItem className=" space-y-0">
                                      {categories[catIdxLv1].category_lv_2[
                                        catIdxLv2
                                      ] &&
                                        categories[catIdxLv1].category_lv_2[
                                          catIdxLv2
                                        ].category_lv_3.map((category, i) => (
                                          <FormControl key={category.id}>
                                            <SelectionButton
                                              name={category.id}
                                              className="w-full"
                                              onClick={() => {
                                                field.onChange(category.id);
                                                setcatIdxLv3(i);
                                                setShowCategories(false);
                                              }}
                                              type="button"
                                            >
                                              <p className=" line-clamp-1 text-left">
                                                {category.name}
                                              </p>
                                              {catIdxLv3 === i && (
                                                <div className="absolute left-0 h-full w-1 animate-quantum_bouncing bg-primary" />
                                              )}
                                            </SelectionButton>
                                          </FormControl>
                                        ))}
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="flex h-[18.5rem] w-full items-center justify-center border-[1px] border-border">
                          <span className="loading loading-dots loading-lg text-primary"></span>
                        </div>
                      ))}
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
                            <RadioGroupItem className="h-7 w-7" value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">New</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem className="h-7 w-7" value="true" />
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
                            <RadioGroupItem className="h-7 w-7" value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Not hazardous
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem className="h-7 w-7" value="true" />
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
                <div className="flex justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      Product Variant
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add variants so buyers can choose the right product, Enter
                      max. 2 types of variants,
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setVariantParent(true);
                      form.setValue("with_parent", true);
                      form.setValue("stock", "0");
                      form.setValue("price", "100");
                      // form.setValue("weight", "100");
                    }}
                    disabled={showCategories || catIdxLv1 === -1}
                    className=" self-end"
                    type="button"
                  >
                    + Add Variant
                  </Button>
                </div>
              </div>
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
                {/* <UniInputDescription
                  formLabel="Courier Services"
                  description="Select your courier service"
                >
                  <FormField
                    control={form.control}
                    name="courier"
                    render={() => (
                      <FormItem className="flex items-center gap-5 space-y-0">
                        {couriers.map((courier) => (
                          <FormField
                            key={courier.id}
                            control={form.control}
                            name="courier"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={courier.id}
                                  className="flex flex-row items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        courier.id,
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              courier.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== courier.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {courier.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </UniInputDescription> */}
              </div>
            </div>
          )}
          {/*With Parent Variant*/}
          {varianParent && (
            <div className="w-full space-y-10 rounded-lg border-[1px] border-border bg-background p-10 shadow-md">
              <div className="flex justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">
                    Product Variant
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add variants so buyers can choose the right product, Enter
                    max. 2 types of variants,
                  </p>
                </div>
                <Button
                  onClick={() => {
                    showModal(
                      <RemoveVariant onRemoveVariant={onRemoveVariant} />,
                    );
                    form.setValue("with_parent", false);
                    form.setValue("with_child", false);
                  }}
                  className=" self-end"
                  type="button"
                >
                  Remove Variant
                </Button>
              </div>
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
                                onValueChange={(e) => setNewVarparent(e)}
                                value={newVarParent}
                                onKeyDown={(e) => onKeyDownVarParent(e)}
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
                                  <CommandItem
                                    value={variant}
                                    key={variant}
                                    onSelect={() => {
                                      form.setValue("variant_parents", variant);
                                      setVariant1(variant);
                                    }}
                                  >
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
                          You can add image into this variant
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                }
              >
                {variant1 === "" && (
                  <>
                    <Input
                      disabled
                      placeholder="Please choose variant group 1 first"
                    />
                  </>
                )}
                <ReactTags
                  readOnly={variant1 === ""}
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
                  handleDelete={handleDeleteType}
                  handleAddition={handleAdditionType}
                  // handleDrag={handleDragType}
                  // handleTagClick={handleTagClick}
                  allowDragDrop={false}
                  inputFieldPosition="bottom"
                  autocomplete
                />
                <div className="mt-3 text-sm">
                  <p className="text-muted-foreground">
                    Use image for variant?{" "}
                    <span className="font-bold ">
                      You have to add pictures in the order, or leave the rest
                      unpictured
                    </span>
                  </p>
                  <input
                    disabled={variant1 === "" || var1Type.length === 0}
                    onChange={() => {
                      setUseVariantImage((prev) => !prev);
                      setProductTypeVariantImages([]);
                    }}
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={useVariantImage}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {useVariantImage && addImageTypeVariantElement}
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
                                  // onClick={() => setNewVarparent("")}
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
                                  onValueChange={(e) => setNewVarChild(e)}
                                  value={newVarChild}
                                  onKeyDown={(e) => onKeyDownVarChild(e)}
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
                                      onSelect={() => {
                                        form.setValue(
                                          "variant_childs",
                                          variantChild,
                                        );
                                        setVariant2(variantChild);
                                      }}
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
                  ) : (
                    <Button
                      onClick={() => {
                        setVariantChild(true);
                        form.setValue("with_child", true);
                      }}
                      disabled={variant1 === "" || parentType.length === 0}
                      // disabled={showCategories || catIdxLv1 === -1}
                      className=" self-end"
                      type="button"
                    >
                      + Add Variant 2
                    </Button>
                  )
                }
              >
                {variant2 === "" && (
                  <>
                    <Input
                      disabled
                      placeholder="Please choose variant group 1 first"
                    />
                  </>
                )}
                <div className="flex w-full items-center gap-3">
                  <ReactTags
                    readOnly={variant2 === ""}
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
                    handleDelete={handleDeleteType2}
                    handleAddition={handleAdditionType2}
                    // handleDrag={handleDragType}
                    // handleTagClick={handleTagClick2}
                    allowDragDrop={false}
                    inputFieldPosition="bottom"
                    autocomplete
                  />
                  {varianChild && (
                    <FaRegTrashCan
                      onClick={() => {
                        showModal(
                          <RemoveChildVariant
                            onRemoveVariantChild={onRemoveVariantChild}
                          />,
                        );
                        form.setValue("with_child", false);
                      }}
                      className="h-5 w-5 cursor-pointer transition-colors hover:text-primary hover:transition-colors"
                    />
                  )}
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
              {/* <UniInputDescription
                formLabel="Courier Services"
                description="Select your courier service"
              >
                <FormField
                  control={form.control}
                  name="courier"
                  render={() => (
                    <FormItem className="flex items-center gap-5 space-y-0">
                      {couriers.map((courier) => (
                        <FormField
                          key={courier.id}
                          control={form.control}
                          name="courier"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={courier.id}
                                className="flex flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(courier.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            courier.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== courier.id,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {courier.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </UniInputDescription> */}
            </div>
          )}
          {varianParent && varianChild && (
            <ButtonWithLoading
              // disabled={
              //   showCategories || catIdxLv1 === -1 || productImages.length === 0
              // }
              disabled={
                showCategories ||
                catIdxLv1 === -1 ||
                productImages.length === 0 ||
                productImages.length === 0 ||
                variant1 === "" ||
                parentType.length === 0 ||
                var2Type.some(
                  (item) =>
                    item.price === "" ||
                    item.stock === "" ||
                    // item.sku === "" ||
                    // item.weight === "" ||
                    parseInt(item.price as string) < 100 ||
                    parseInt(item.price as string) > 100000000000000 ||
                    parseInt(item.stock as string) < 0 ||
                    parseInt(item.stock as string) > 100000,
                  // parseInt(item.weight as string) < 1 ||
                  // parseInt(item.weight as string) > 500000,
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
              // disabled={
              //   showCategories || catIdxLv1 === -1 || productImages.length === 0
              // }
              disabled={
                showCategories ||
                catIdxLv1 === -1 ||
                productImages.length === 0 ||
                productImages.length === 0 ||
                variant1 === "" ||
                parentType.length === 0 ||
                var1Type.some(
                  (item) =>
                    item.price === "" ||
                    item.stock === "" ||
                    // item.sku === "" ||
                    // item.weight === "" ||
                    parseInt(item.price as string) < 100 ||
                    parseInt(item.price as string) > 100000000000000 ||
                    parseInt(item.stock as string) < 0 ||
                    parseInt(item.stock as string) > 100000,
                  // parseInt(item.weight as string) < 1 ||
                  // parseInt(item.weight as string) > 500000,
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
              disabled={
                showCategories || catIdxLv1 === -1 || productImages.length === 0
              }
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
