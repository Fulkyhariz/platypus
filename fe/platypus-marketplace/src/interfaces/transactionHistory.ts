export interface IUserTransaction {
  order_id: number;
  merchant: [
    {
      order_detail_id: number;
      courier_id: number;
      invoice: string;
      merchant_id: number;
      merchant_name: string;
      address: string;
      product: [
        {
          product_id: number;
          product_name: string;
          order_detail_product_id: string;
          variant_combination_product_id: number;
          photo: string;
          quantity: number;
          product_price: string;
          is_reviewed: boolean;
        },
      ];
      estimated_time: string;
      initial_price: string;
      final_price: string;
      status: string;
    },
  ];
  order_price: string;
}
