package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type CheckoutProduct struct {
	CartProductID               uint64          `gorm:"column:cart_product_id"`
	ProductID                   uint64          `gorm:"column:product_id"`
	MerchantID                  uint64          `gorm:"column:merchant_id"`
	Weight                      float64         `gorm:"column:weight"`
	VariantCombinationProductID uint64          `gorm:"column:variant_combination_product_id"`
	Title                       string          `gorm:"column:title"`
	Photos                      []Photos        `gorm:"-"`
	Amount                      uint64          `gorm:"column:amount"`
	Description                 string          `gorm:"column:description"`
	VariantParrent              string          `gorm:"column:variant_parrent"`
	VariantChild                string          `gorm:"column:variant_child"`
	Price                       decimal.Decimal `gorm:"column:price"`
	Stock                       uint64          `gorm:"column:stock"`
}

type Photos struct {
	Url       string `gorm:"column:url"`
	IsDefault bool   `gorm:"column:is_default"`
}

type PromotionProduct struct {
	Id             uint64    `gorm:"column:id"`
	MerchantId     *uint64   `gorm:"column:merchant_id"`
	ProductId      *uint64   `gorm:"column:product_id"`
	PromotionType  string    `gorm:"column:promotion_type"`
	PromotionScope string    `gorm:"column:promotion_scope"`
	Amount         float64   `gorm:"column:amount"`
	StartDate      time.Time `gorm:"column:start_date"`
	EndDate        time.Time `gorm:"column:end_date"`
	Quota          uint64   `gorm:"column:quota"`
	MaxAmount      *float64  `gorm:"column:max_amount"`
}

type PromoName struct {
	Id   uint64 `gorm:"column:promotion_id"`
	Name string `gorm:"column:promo_name"`
}
