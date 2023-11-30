export interface IAddSingleProductPayload {
  title: string;
  category_lv1_id: string;
  category_lv2_id: string | null;
  category_lv3_id: string | null;
  is_used: boolean;
  is_hazardous: boolean;
  description: string;
  video?: string;
  price: string;
  stock: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  courier: string[];
  photos: File[];
}

export interface IVariantType {
  id: string;
  text: string;
}

export interface ITypeValue {
  groupName: string | undefined;
  type: string | undefined;
  price: string | undefined;
  stock: string | undefined;
  sku: string | undefined;
  weight: string | undefined;
  status: boolean | undefined;
  picture?: string | undefined;
}

export interface ITypeValueWithChild {
  parentType: string | undefined;
  childType: string | undefined;
  type: string | undefined;
  price: string | undefined;
  stock: string | undefined;
  sku: string | undefined;
  weight: string | undefined;
  status: boolean | undefined;
  picture?: string | undefined;
}

export interface ITypeValueWithChildEdit {
  id: number;
  parentType: string | undefined;
  childType: string | undefined;
  type: string | undefined;
  price: string | undefined;
  stock: string | undefined;
  sku: string | undefined;
  weight: string | undefined;
  status: boolean | undefined;
  picture?: string | undefined;
}

export interface IProductMyList {
  id: number;
  merchant_id: number;
  username: string;
  title: string;
  photo: string;
  total_sold: number;
  favorite_count: number;
  average_rating: number;
  total_stock: number;
  city: string;
  category_lv1_id: string;
  category_lv2_id: string;
  category_lv3_id: string;
  min_price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IMyProductContainer {
  onChangeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFilter: (key: string, value: number | string | boolean) => void;
}
