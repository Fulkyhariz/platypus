export interface ISellerPromoDetail {
  id: number;
  name: string;
  banner: string;
  promotion_type: string;
  promotion_scope: string;
  voucher_code: string;
  amount: string;
  quota: string;
  max_amount: string | null;
  products: ISellerPromoProductDetail[] | null;
  start_date: string;
  end_date: string;
  promotion_status: string;
}

export interface ISellerPromoProductDetail {
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
