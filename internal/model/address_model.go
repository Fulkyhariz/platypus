package model

import "time"

type Address struct {
	ID             uint64     `gorm:"column:id"`
	UserId         uint64     `gorm:"column:user_id"`
	PhoneNumber    string     `gorm:"column:phone_number"`
	Name           string     `gorm:"column:name"`
	Province       string     `gorm:"column:province"`
	ProvinceCode   uint64     `gorm:"column:province_code"`
	District       string     `gorm:"column:district"`
	DistrictCode   uint64     `gorm:"column:district_code"`
	SubDistrict    string     `gorm:"column:sub_district"`
	SubSubDistrict string     `gorm:"column:sub_sub_district"`
	ZipCode        uint64     `gorm:"column:zip_code"`
	Details        string     `gorm:"column:details"`
	IsShopLocation bool       `gorm:"column:is_shop_location"`
	IsDefault      bool       `gorm:"column:is_default"`
	CreatedAt      time.Time  `gorm:"column:created_at"`
	UpdatedAt      time.Time  `gorm:"column:updated_at"`
	DeletedAt      *time.Time `gorm:"column:deleted_at"`
}
