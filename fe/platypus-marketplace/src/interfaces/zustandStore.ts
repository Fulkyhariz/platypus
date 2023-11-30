export interface IItemsAmount {
  merchant_name: string;
  cart_product_id: number;
  product_id: number;
  merchant_id: number;
  title: string;
  photo: string;
  amount: number;
  variant: string;
  weight: number;
  price: number;
  stock: number;
  variant_combination_product_id: number;
  city_id: number;
  cutted_price?: number;
  cut_price?: number;
  discount?: number;
}

export interface IGroupedCart {
  merchant_id: number;
  merchant_name: string;
  city_id: number;
  total_weight: number;
  total_cost: number;
  courier_cost: number;
  courier_select: string;
  photo: string;
  cart: IItemsAmount[];
}

export interface ICheckPriceProductsResponse {
  product_id: number;
  product_name: string;
  total_price: string;
  cutted_price?: string;
  discount?: string;
  cut_price?: string;
  initial_price?: string;
}

export interface ICheckMerchantPrice {
  merchant_id: number;
  merchant_name: string;
  total_price: string;
  cutted_price?: string;
  cut_price?: string;
  discount?: string;
  initial_price?: string;
  ongkir: string;
  CheckPriceProducts: ICheckPriceProductsResponse[];
}

export interface ICheckPriceResponse {
  total_price: string;
  discount?: string;
  cut_price?: string;
  cutted_price?: string;
  initial_price?: string;
  merchant: ICheckMerchantPrice[];
}
