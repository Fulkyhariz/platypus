package dto

import (
	"digital-test-vm/be/internal/model"

	"github.com/shopspring/decimal"
)

type CartProduct struct {
	Id                          uint64          `json:"cart_product_id"`
	ProductId                   uint64          `json:"product_id"`
	MerchantId                  uint64          `json:"merchant_id"`
	MerchantName                string          `json:"merchant_name"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	MerchantCityId              uint64          `json:"city_id"`
	Title                       string          `json:"title"`
	Photo                       string          `json:"photo"`
	Amount                      uint64          `json:"amount"`
	Variant                     string          `json:"variant"`
	Weight                      float64         `json:"weight"`
	Price                       decimal.Decimal `json:"price"`
	Stock                       uint64          `json:"stock"`
}

func CartProductToDTO(products []model.CartProductDetail) []CartProduct {
	var carts []CartProduct
	for _, product := range products {
		cart := CartProduct{
			Id:                          product.CartProductId,
			ProductId:                   product.ProductId,
			MerchantId:                  product.MerchantId,
			Weight:                      product.Weight,
			VariantCombinationProductId: product.VariantCombinationProductId,
			Title:                       product.Title,
			Photo:                       product.Photo,
			Amount:                      product.Amount,
			Price:                       product.Price,
			Stock:                       product.Stock,
			MerchantName:                product.MerchantName,
			MerchantCityId:              product.MerchantCityId,
		}
		cart.Variant = product.VariantParrent + " - " + product.VariantChild
		if product.VariantChild == "" {
			cart.Variant = product.VariantParrent
		}
		if product.VariantParrent == "" {
			cart.Variant = product.VariantChild
		}
		if product.VariantParrent == "DEFAULT" {
			cart.Variant = ""
		}
		carts = append(carts, cart)
	}
	return carts
}
