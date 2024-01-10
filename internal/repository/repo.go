package repo

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Repo struct {
	VariantRepo         VariantRepo
	ProductFavoriteRepo ProductFavoriteRepo
	UserRepo            UserRepo
	AddressRepo         AddressRepo
	MerchantRepo        MerchantRepo
	CategoryRepo        CategoryRepo
	ProductRepo         ProductRepo
	CartRepo            CartRepo
	ProductReviewRepo   ProductReviewRepo
	WalletRepo          WalletRepo
	TransactionRepo     TransactionRepo
	OrderRepo           OrderRepo
	ProductPhotoRepo    ProductPhotoRepo
	CourierRepo         CourierRepo
	CheckoutRepo        CheckoutRepo
	PromotionRepo       PromotionRepo
}

func NewRepo(db *gorm.DB, redis *redis.Client) *Repo {
	repo := &Repo{
		VariantRepo:         NewVariantRepo(db),
		ProductFavoriteRepo: NewProductFavoriteRepo(db),
		MerchantRepo:        NewMerchantRepo(db),
		CategoryRepo:        NewCategoryRepo(db),
		CartRepo:            NewCartRepo(db),
		ProductReviewRepo:   NewProductReviewRepo(db),
		AddressRepo:         NewAddressRepo(db, redis),
		WalletRepo:          NewWalletRepo(db, redis),
		ProductPhotoRepo:    NewProductPhotoRepo(db),
		CourierRepo:         NewCourierRepo(db),
	}
	repo.ProductRepo = NewProductRepo(db, repo.MerchantRepo, repo.CategoryRepo, repo.ProductFavoriteRepo, repo.VariantRepo)
	repo.UserRepo = NewUserRepo(db, redis, repo.CartRepo)
	repo.TransactionRepo = NewTransactionRepo(db, repo.WalletRepo, redis)
	repo.CheckoutRepo = NewCheckoutRepo(db, repo.TransactionRepo, repo.WalletRepo)
	repo.OrderRepo = NewOrderRepo(db, repo.TransactionRepo, repo.ProductReviewRepo)
	repo.PromotionRepo = NewPromotionRepo(db, repo.ProductRepo)

	return repo
}
