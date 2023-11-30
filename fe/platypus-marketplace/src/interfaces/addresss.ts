export interface INewAddressPayload {
  name: string;
  province: string;
  province_code: number;
  district: string;
  district_code: number;
  sub_district: string;
  sub_sub_district: string;
  zip_code: number;
  phone_number: string;
  details: string;
}
export interface IEditAddressPayload {
  id: number;
  name: string;
  province: string;
  province_code: number;
  district: string;
  district_code: number;
  sub_district: string;
  sub_sub_district: string;
  zip_code: number;
  phone_number: string;
  details: string;
}
