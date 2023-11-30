export interface IProductsInOrderList {
  product_id: number;
  product_name: string;
  variant_combination_product_id: number;
  photo: string;
  quantity: number;
  product_price: string;
}

export interface ISellerOrderList {
  order_detail_id: number;
  courier_id: string;
  invoice: string;
  status: string;
  user_id: number;
  username: string;
  address: string;
  product: IProductsInOrderList[];
  estimated_time: string;
  initial_price: string;
  final_price: string;
}

export interface IDetailOrderData {
  order_detail_id: number;
  courier_id: string;
  invoice: string;
  status: string;
  user_id: number;
  username: string;
  address: string;
  product: IProductsInOrderList[];
  estimated_time: string;
  initial_price: string;
  final_price: string;
}
