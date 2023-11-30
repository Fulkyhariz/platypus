export interface IProvice {
  province_id: string;
  province: string;
}

export interface ICity {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

export interface ICostRajaOngkirPayload {
  origin: number;
  destination: number;
  weight: number;
  courier: string;
  image: string;
}
