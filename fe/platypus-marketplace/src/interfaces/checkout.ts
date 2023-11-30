export interface ISingleCartPayload {
  merchant_id: number;
  courier_id: string;
  courier_price: string;
}
export interface ICheckOutPayload {
  cart_id: number;
  address_id: number;
  voucher_id?: number;
  merchant: ISingleCartPayload[];
}

export interface ICheckPrice {
  cart_id: number;
  address_id: number;
  voucher_id: number;
  merchant: ISingleCartPayload[];
}

export interface IPromos {
  id: number;
  name: string;
}
