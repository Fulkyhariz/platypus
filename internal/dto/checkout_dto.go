package dto

import (
	"time"

	"github.com/shopspring/decimal"
)

type Orders struct {
	Id           uint64          `json:"id"`
	CartId       uint64          `json:"cart_id"`
	FinalPrice   decimal.Decimal `json:"final_price"`
	InitialPrice decimal.Decimal `json:"initial_price"`
	OrderDate    time.Time       `json:"order_date"`
	VoucherId    *uint64         `json:"voucher_id"`
	OrderDetails []OrderDetails
	User         UserInfo
}

type OrderDetails struct {
	Id                  uint64    `json:"id"`
	OrderId             uint64    `json:"order_id"`
	MerchantId          uint64    `json:"merchant_id"`
	CourierId           string    `json:"courier_id"`
	OrderStatus         string    `json:"order_status"`
	EstimatedTime       time.Time `json:"estimated_time"`
	Address             string    `json:"address"`
	CourierPrice        decimal.Decimal `json:"courier_price"`
	FinalPrice          decimal.Decimal `json:"final_price"`
	InitialPrice        decimal.Decimal `json:"initial_price"`
	Invoice             string          `json:"invoice"`
	OrderDetailProducts []OrderDetailProducts
}

type OrderDetailProducts struct {
	Id                          uint64          `json:"id"`
	OrderDetailId               uint64          `json:"order_id"`
	ProductId                   uint64          `json:"product_id"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	Quantity                    uint64          `json:"quantity"`
	Price                       decimal.Decimal `json:"price"`
	Name                        string          `json:"name"`
	Description                 string          `json:"description"`
	FinalPrice                  decimal.Decimal `json:"final_price"`
	InitialPrice                decimal.Decimal `json:"initial_price"`
	MerchantId                  uint64          `json:"merchant_id"`
}
