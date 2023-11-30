export interface IDetailCategories {
  sequence_id: string;
  id: string;
  name: string;
  category_lv_2?: ICategoryLv2;
}

export interface ICategoryLv2 {
  sequence_id: string;
  id: string;
  name: string;
  category_lv_1_id: string;
  category_lv_3?: ICategoryLv3;
}

export interface ICategoryLv3 {
  sequence_id: string;
  id: string;
  name: string;
  category_lv_2_id: string;
}

export interface IChildVariant {
  variant_combination_product_id: number;
  child_name: string;
  child_group: string;
  price: string;
  stock: number;
  child_picture?: string;
}

export interface IParentHasChildVariant {
  variant_combination_product_id?: number;
  parent_name: string;
  parent_group: string;
  variant_child: IChildVariant[];
  price: string;
  parent_picture?: string;
}

export interface IOnlyParentVariant {
  variant_combination_product_id: number;
  parent_name: string | "Default";
  parent_group: string | "Default";
  price: string;
  stock?: number;
  parent_picture?: string;
}

export interface IParentVariant {
  variant_combination_product_id?: number;
  parent_name: string | "Default";
  parent_group: string | "Default";
  price: string;
  stock?: number;
  parent_picture?: string;
}

// export interface IDetailCategories {
//   category_lv_1: ICategory;
// }

export interface IProductMerchant {
  id: number;
  name: string;
  phone_number: string;
  rating: number;
  opening_date: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IProductDetail {
  product_id: number;
  product_name: string;
  username: string;
  description: string;
  average_rating: number;
  default_photo: string;
  total_rating: number;
  favorite_count: number;
  is_favorites: boolean;
  photos: string[];
  category_lv_1: IDetailCategories;
  min_price: string;
  max_price: string;
  total_sold: number;
  merchant: IProductMerchant;
  variant: IOnlyParentVariant[] | IParentHasChildVariant[];
  created_at: string;
  updated_at: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  is_hazardous: boolean;
  is_used: boolean;
}

export interface IProductMerchantRecommendation {
  id: number;
  merchant_id: number;
  title: string;
  photo: string;
  video: string;
  total_sold: number;
  city: string;
  favorite_count: number;
  average_rating: number;
  total_stock: number;
  category_lv1_id: string;
  category_lv2_id: string;
  category_lv3_id: string;
  min_price: string;
  created_at: string;
  updated_at: string;
}

export interface IProdEditPhotos {
  id?: number;
  url: string;
  is_default: boolean;
}

//parent type
export interface IProdEditParentVariantType {
  id: number;
  type: string;
  image?: string;
}

//parent
export interface IProdEditParentVariants {
  id: number;
  group: string;
  types: IProdEditParentVariantType[];
}

//child type
export interface IProdEditChildVariantType {
  id: number;
  type: string;
}

//child
export interface IProdEditChildVariants {
  id: number;
  group: string;
  types: IProdEditChildVariantType[];
}

export interface IProdEditCombinationParentType {
  id: number;
  type: string;
  image?: string;
}

export interface IProdEditCombinationChildType {
  id: number;
  type: string;
}

export interface IProdEditCombination {
  id: number;
  parent_type: IProdEditCombinationParentType;
  child_type: IProdEditCombinationChildType | null;
  price: string;
  stock: number;
}

export interface IProdEditVariants {
  parent: IProdEditParentVariants;
  child: IProdEditChildVariants | null;
  combinations: IProdEditCombination[];
}

export interface IProdEditCourier {
  id: number;
  name: string;
}

export interface IProdDetailEditData {
  id: number;
  title: string;
  photos: IProdEditPhotos[];
  video: string;
  description: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  is_used: boolean;
  is_hazardous: boolean;
  category_lv1_id: string;
  category_lv2_id: string;
  category_lv3_id: string;
  variants: IProdEditVariants;
  couriers: IProdEditCourier[];
}
