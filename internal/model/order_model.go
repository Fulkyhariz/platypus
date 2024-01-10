package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Orders struct {
	Id           uint64          `json:"id"`
	CartId       uint64          `json:"cart_id"`
	InitialPrice decimal.Decimal `json:"initial_price"`
	FinalPrice   decimal.Decimal `json:"final_price"`
	OrderDate    time.Time       `json:"order_date"`
	VoucherId    *uint64         `gorm:"column:voucher_id"`
	CreatedAt    time.Time       `json:"created_at" gorm:"default:now()"`
	UpdatedAt    time.Time       `json:"updated_at" gorm:"default:now()"`
	DeletedAt    *time.Time      `json:"-" gorm:"default:null"`
}

type OrderDetails struct {
	Id            uint64          `json:"id"`
	OrderId       uint64          `json:"order_id"`
	MerchantId    uint64          `json:"merchant_id"`
	CourierId     string          `json:"courier_id"`
	OrderStatus   string          `json:"order_status"`
	EstimatedTime time.Time       `json:"estimated_time"`
	Address       string          `gorm:"column:address"`
	CourierPrice  decimal.Decimal `gorm:"column:courier_price"`
	InitialPrice  decimal.Decimal `json:"initial_price"`
	FinalPrice    decimal.Decimal `json:"final_price"`
	Invoice       string          `gorm:"column:invoice"`
	CreatedAt     time.Time       `json:"created_at" gorm:"default:now()"`
	UpdatedAt     time.Time       `json:"updated_at" gorm:"default:now()"`
	DeletedAt     *time.Time      `json:"-" gorm:"default:null"`
	OrderDetailProducts []OrderDetailProducts `gorm:"-"`
}

type OrderDetailProducts struct {
	Id                          uint64          `json:"id"`
	OrderDetailId               uint64          `json:"order_id"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	Quantity                    uint64          `json:"quantity"`
	InitialPrice                decimal.Decimal `json:"initial_price"`
	FinalPrice                  decimal.Decimal `json:"final_price"`
	Name                        string          `json:"name"`
	Description                 string          `json:"description"`
	Price                       decimal.Decimal `json:"price"`
	MerchantId                  uint64          `json:"merchant_id"`
	CreatedAt                   time.Time       `json:"created_at" gorm:"default:now()"`
	UpdatedAt                   time.Time       `json:"updated_at" gorm:"default:now()"`
	DeletedAt                   *time.Time      `json:"-" gorm:"default:null"`
}
