package dto

import "digital-test-vm/be/internal/model"

type Address struct {
	ID             uint64 `json:"id"`
	UserId         uint64 `json:"user_id"`
	PhoneNumber    string `json:"phone_number"`
	Name           string `json:"name"`
	Province       string `json:"province"`
	ProvinceCode   uint64 `json:"province_code"`
	District       string `json:"district"`
	DistrictCode   uint64 `json:"district_code"`
	SubDistrict    string `json:"sub_district"`
	SubSubDistrict string `json:"sub_sub_district"`
	ZipCode        uint64 `json:"zip_code"`
	Details        string `json:"details"`
	IsShopLocation bool   `json:"is_shop_location"`
	IsDefault      bool   `json:"is_default"`
}

func (a *Address) ToModel() *model.Address {
	return &model.Address{
		ID:             a.ID,
		UserId:         a.UserId,
		PhoneNumber:    a.PhoneNumber,
		Name:           a.Name,
		Province:       a.Province,
		ProvinceCode:   a.ProvinceCode,
		District:       a.District,
		DistrictCode:   a.DistrictCode,
		SubDistrict:    a.SubDistrict,
		SubSubDistrict: a.SubSubDistrict,
		ZipCode:        a.ZipCode,
		Details:        a.Details,
		IsShopLocation: a.IsShopLocation,
		IsDefault:      a.IsDefault,
	}
}

func AddressToDTOs(addressModel []model.Address) []Address {
	var addresses []Address
	for _, address := range addressModel {
		addresses = append(addresses, 
			Address{
				ID:             address.ID,
				UserId:         address.UserId,
				PhoneNumber:    address.PhoneNumber,
				Province:       address.Province,
				Name:           address.Name,
				ProvinceCode:   address.ProvinceCode,
				District:       address.District,
				DistrictCode:   address.DistrictCode,
				SubDistrict:    address.SubDistrict,
				SubSubDistrict: address.SubSubDistrict,
				ZipCode:        address.ZipCode,
				Details:        address.Details,
				IsShopLocation: address.IsShopLocation,
				IsDefault:      address.IsDefault,
			},
		) 
	}
	return addresses
}

func AddressToDTO(address *model.Address) *Address {
	return &Address{
		ID:             address.ID,
		UserId:         address.UserId,
		PhoneNumber:    address.PhoneNumber,
		Province:       address.Province,
		Name:           address.Name,
		ProvinceCode:   address.ProvinceCode,
		District:       address.District,
		DistrictCode:   address.DistrictCode,
		SubDistrict:    address.SubDistrict,
		SubSubDistrict: address.SubSubDistrict,
		ZipCode:        address.ZipCode,
		Details:        address.Details,
		IsShopLocation: address.IsShopLocation,
		IsDefault:      address.IsDefault,
	}
}
