package usecase

import repo "digital-test-vm/be/internal/repository"

type Usecase struct {
	ProductUsecase         ProductUsecase
	ProductFavoriteUseCase ProductFavoriteUsecase
	UserUsecase            UserUsecase
	AddressUsecase         AddressUsecase
	MerchantUsecase        MerchantUsecase
	CategoryUsecase        CategoryUsecase
	CartUsecase            CartUsecase
	ProductReviewUsecase   ProductReviewUsecase
	WalletUsecase          WalletUsecase
	OrderUsecase           OrderUsecase
	CheckoutUsecase        CheckoutUsecase
	PromotionUsecase       PromotionUsecase
	Cron                   Cron
}

func NewUsecase(repo *repo.Repo) *Usecase {
	return &Usecase{
		ProductUsecase:         NewProductUsecase(repo),
		ProductFavoriteUseCase: NewProductFavoriteUsecase(repo),
		UserUsecase:            NewUserUsecase(repo),
		AddressUsecase:         NewAddressUsecase(repo),
		MerchantUsecase:        NewMerchantUsecase(repo),
		CategoryUsecase:        NewCategoryUsecase(repo),
		CartUsecase:            NewCartUsecase(repo),
		ProductReviewUsecase:   NewProductReviewUsecase(repo),
		WalletUsecase:          NewWalletUsecase(repo),
		OrderUsecase:           NewOrderUsecase(repo),
		CheckoutUsecase:        NewCheckoutUsecase(repo),
		PromotionUsecase:       NewPromotionUsecase(repo),
		Cron:                   *New(repo.OrderRepo),
	}
}
