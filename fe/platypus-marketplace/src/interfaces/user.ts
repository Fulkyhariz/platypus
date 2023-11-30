export interface IUserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone_number: string;
  gender: "M" | "F";
  date_of_birth: string;
  is_seller: boolean;
  profile_picture: string;
}

export interface IUserAddresses {
  id: number;
  name: string;
  province: string;
  province_code: number;
  district: string;
  district_code: number;
  sub_district: string;
  sub_sub_district: string;
  zip_code: number;
  details: string;
  is_shop_location: boolean;
  is_default: boolean;
  phone_number: string;
}

export interface IUserLogin {
  username: string;
  password: string;
}
