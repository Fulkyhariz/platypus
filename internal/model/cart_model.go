package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Cart struct {
	ID        uint64     `json:"id"`
	UserId    uint64     `json:"user_id"`
	CreatedAt time.Time  `gorm:"column:created_at"`
	UpdatedAt time.Time  `gorm:"column:updated_at"`
	DeletedAt *time.Time `gorm:"column:deleted_at"`
}

type CartProducts struct {
	ID                          uint64                     `json:"id" gorm:"primarykey"`
	CartId                      uint64                     `json:"cart_id" binding:"required"`
	Cart                        Cart                       `gorm:"-"`
	VariantCombinationProductId uint64                     `json:"variant_combination_product_id" binding:"required"`
	VariantCombinationProducts  VariantCombinationProduct `gorm:"-"`
	Quantity                    uint64                     `json:"quantity" binding:"required"`
	CreatedAt                   time.Time                  `gorm:"column:created_at"`
	UpdatedAt                   time.Time                  `gorm:"column:updated_at"`
	DeletedAt                   *time.Time                 `gorm:"column:deleted_at"`
}

type CartProductDetail struct {
	CartProductId               uint64          `gorm:"column:cart_product_id"`
	ProductId                   uint64          `gorm:"column:product_id"`
	MerchantId                  uint64          `gorm:"column:merchant_id"`
	MerchantCityId              uint64          `gorm:"column:city_id"`
	MerchantName                string          `gorm:"column:merchant_name"`
	Weight                      float64         `gorm:"column:weight"`
	VariantCombinationProductId uint64          `gorm:"column:variant_combination_product_id"`
	Title                       string          `gorm:"column:title"`
	Photo                       string          `gorm:"column:photo"`
	Amount                      uint64          `gorm:"column:amount"`
	VariantParrent              string          `gorm:"column:variant_parrent"`
	VariantChild                string          `gorm:"column:variant_child"`
	Price                       decimal.Decimal `gorm:"column:price"`
	Stock                       uint64          `gorm:"column:stock"`
}

type CartProduct struct {
	ID                          uint64                     `json:"id" gorm:"primarykey"`
	CartId                      uint64                     `json:"cart_id" binding:"required"`
	Cart                        Cart                       `gorm:"-"`
	VariantCombinationProductId uint64                     `json:"variant_combination_product_id" binding:"required"`
	VariantCombinationProducts  VariantCombinationProduct `gorm:"-"`
	Quantity                    uint64                     `json:"quantity" binding:"required"`
	CreatedAt                   time.Time                  `gorm:"column:created_at"`
	UpdatedAt                   time.Time                  `gorm:"column:updated_at"`
	DeletedAt                   *time.Time                 `gorm:"column:deleted_at"`
}
