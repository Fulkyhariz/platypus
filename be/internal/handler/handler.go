package handler

import (
	"digital-test-vm/be/internal/usecase"
)

type Handler struct {
	Ping                   *PingHandler
	ProductHandler         *ProductHandler
	ProductFavoriteHandler *ProductFavoriteHandler
	UserHandler            *UserHandler
	AddressHandler         *AddressHandler
	MerchantHandler        *MerchantHandler
	CategoryHandler        *CategoryHandler
	CartHandler            *CartHandler
	ProductReviewHandler   *ProductReviewHandler
	WalletHandler          *WalletHandler
	OrderHandler           *OrderHandler
	CheckoutHandler        *CheckoutHandler
	PromotionHandler       *PromotionHandler
}

func NewHandler(usecase *usecase.Usecase) *Handler {
	return &Handler{
		Ping:                   NewPingHandler(),
		ProductHandler:         NewProductHandler(usecase),
		ProductFavoriteHandler: NewProductFavoriteHandler(usecase),
		UserHandler:            NewUserHandler(usecase),
		AddressHandler:         NewAddressHandler(usecase),
		MerchantHandler:        NewMerchantHandler(usecase),
		CategoryHandler:        NewCategoryHandler(usecase),
		CartHandler:            NewCartHandler(usecase),
		ProductReviewHandler:   NewProductReviewHandler(usecase),
		WalletHandler:          NewWalletHandler(usecase),
		OrderHandler:           NewOrderHandler(usecase),
		CheckoutHandler:        NewCheckoutHandler(usecase),
		PromotionHandler:       NewPromotionHandler(usecase),
	}
}
