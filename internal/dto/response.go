package dto

import (
	"digital-test-vm/be/internal/model"
	"time"

	"github.com/shopspring/decimal"
)

// Standardized response
type JSONResponse struct {
	Data    any    `json:"data,omitempty"`
	Meta    *Meta  `json:"meta,omitempty"`
	Message string `json:"message,omitempty"`
	Error   error  `json:"error,omitempty"`
}

type TokenResponse struct {
	RefreshToken string `json:"refresh_token,omitempty"`
	AccessToken  string `json:"access_token,omitempty"`
	UserData     any    `json:"user_data,omitempty"`
}

func ToTokenResponse(token map[string]string) TokenResponse {
	return TokenResponse{
		RefreshToken: token["refresh"],
		AccessToken:  token["access"],
	}
}

type MerchantResponse struct {
	ID          uint64        `json:"id"`
	Name        string        `json:"name"`
	PhoneNumber string        `json:"phone_number"`
	Rating      float32       `json:"rating"`
	OpeningDate time.Time     `json:"opening_date"`
	UserID      uint64        `json:"user_id"`
	Username    string        `json:"user_name,omitempty"`
	Photo       string        `json:"photo"`
	Banner      string        `json:"banner"`
	Address     *Address      `json:"address"`
	User        *UserResponse `json:"user,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type UserResponse struct {
	ID             uint64    `json:"id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Username       string    `json:"username"`
	Email          string    `json:"email"`
	PhoneNumber    string    `json:"phone_number"`
	IsSeller       bool      `json:"is_seller"`
	Gender         string    `json:"gender"`
	ProfilePicture *string   `json:"profile_picture"`
	DateOfBirth    time.Time `json:"date_of_birth"`
}

// wallet response
type WalletResponse struct {
	ID       uint64          `json:"id"`
	WalletId string          `json:"wallet_id"`
	UserId   uint64          `json:"user_id"`
	Balance  decimal.Decimal `json:"balance"`
}

type BlockWalletResponse struct {
	ExpiredAt *time.Time `json:"expired_at"`
}

type WalletHistoryResponse struct {
	Id          uint64  `json:"id"`
	WalletId    uint64  `json:"wallet_id"`
	RecipientId uint64  `json:"recipient_id"`
	SenderId    *uint64 `json:"sender_id"`
	Amount      string  `json:"amount"`
	Description string  `json:"description"`
}

func ToHistoryResponse(history model.WalletHistory) WalletHistoryResponse {
	return WalletHistoryResponse{
		Id:          history.Id,
		WalletId:    history.WalletId,
		RecipientId: history.RecipientId,
		SenderId:    history.SenderId,
		Amount:      history.Amount.String(),
		Description: history.Description,
	}
}

func ToHistoryResponses(models []model.WalletHistory) []WalletHistoryResponse {
	var histories []WalletHistoryResponse
	for _, model := range models {
		histories = append(histories, ToHistoryResponse(model))
	}
	return histories
}

type ProductDetail struct {
	Id            uint64                `json:"product_id"`
	ProductName   string                `json:"product_name"`
	Description   string                `json:"description"`
	AverageRating float64               `json:"average_rating"`
	TotalRating   uint64                `json:"total_rating"`
	Length        float64               `json:"length"`
	Width         float64               `json:"width"`
	Height        float64               `json:"height"`
	Weight        float64               `json:"weight"`
	IsHazardous   bool                  `json:"is_hazardous"`
	IsUsed        bool                  `json:"is_used"`
	FavoriteCount uint64                `json:"favorite_count"`
	DefaultPhoto  string                `json:"default_photo"`
	Photos        []string              `json:"photos"`
	Category      model.CategoriesLv1   `json:"category_lv_1"`
	MinPrice      decimal.Decimal       `json:"min_price"`
	MaxPrice      decimal.Decimal       `json:"max_price"`
	TotalSold     uint64                `json:"total_sold" gorm:"type:decimal(64,2);"`
	Merchant      model.Merchant        `json:"merchant"`
	Username      string                `json:"username"`
	Variant       []model.VariantParent `json:"variant,omitempty"`
	CreatedAt     time.Time             `json:"created_at"`
	UpdatedAt     time.Time             `json:"updated_at"`
}

type ProductReview struct {
	ID             uint64    `json:"id"`
	UserName       string    `json:"user_name"`
	Rating         uint64    `json:"rating"`
	ProfilePicture string    `json:"profile_picture"`
	Images         []string  `json:"images"`
	Description    string    `json:"comment"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Meta struct {
	PaginationInfo PaginationInfo `json:"pagination_info,omitempty"`
}

type PaginationInfo struct {
	TotalItems  int64 `json:"total_items"`
	TotalPages  int64 `json:"total_pages"`
	CurrentPage int64 `json:"current_page"`
}

type ListProductsResponse struct {
	ID            uint64          `json:"id"`
	MerchantId    uint64          `json:"merchant_id"`
	Username      string          `json:"username,omitempty"`
	Title         string          `json:"title"`
	Photo         string          `json:"photo"`
	TotalSold     uint64          `json:"total_sold"`
	FavCount      uint64          `json:"favorite_count"`
	AverageRating float64         `json:"average_rating"`
	TotalStock    uint64          `json:"total_stock"`
	City          string          `json:"city"`
	CategoryLv1Id string          `json:"category_lv1_id"`
	CategoryLv2Id string          `json:"category_lv2_id"`
	CategoryLv3Id string          `json:"category_lv3_id"`
	MinPrice      decimal.Decimal `json:"min_price"`
	IsActive      bool            `json:"is_active"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

type CartResponse struct {
	ID       uint64        `json:"id"`
	Total    string        `json:"total"`
	Products []CartProduct `json:"products"`
}

type IsFavoriteResponse struct {
	IsFavorite bool `json:"is_favorite"`
}

type ProductPhotosReviewResponse struct {
	Url string `json:"url"`
}

type ManageProductResponse struct {
	ID            uint64                       `json:"id,omitempty"`
	Title         string                       `json:"title" binding:"required"`
	Photos        []ManageProductPhotoResponse `json:"photos" binding:"required"`
	Video         string                       `json:"video"`
	Description   string                       `json:"description" binding:"required"`
	Length        string                       `json:"length" binding:"required,numeric"`
	Width         string                       `json:"width" binding:"required,numeric"`
	Height        string                       `json:"height" binding:"required,numeric"`
	Weight        string                       `json:"weight" binding:"required,numeric"`
	IsUsed        bool                         `json:"is_used" binding:"boolean"`
	IsHazardous   bool                         `json:"is_hazardous" binding:"boolean"`
	CategoryLV1ID string                       `json:"category_lv1_id" binding:"required"`
	CategoryLV2ID string                       `json:"category_lv2_id"`
	CategoryLV3ID string                       `json:"category_lv3_id"`
	Variants      ManageVariantResponse        `json:"variants" binding:"required"`
	Couriers      []ManageCourierResponse      `json:"couriers" binding:"required"`
}

type ManageProductPhotoResponse struct {
	ID        uint64 `json:"id,omitempty"`
	URL       string `json:"url" binding:"required,url"`
	IsDefault bool   `json:"is_default" binding:"required,boolean"`
}

type ManageVariantResponse struct {
	ID           uint64                             `json:"id,omitempty"`
	Parent       ManageVariantGroupResponse         `json:"parent" binding:"required"`
	Child        *ManageVariantGroupResponse        `json:"child"`
	Combinations []ManageVariantCombinationResponse `json:"combinations" binding:"required"`
}

type ManageVariantGroupResponse struct {
	ID    uint64                      `json:"id,omitempty"`
	Group string                      `json:"group" binding:"required"`
	Types []ManageVariantTypeResponse `json:"types" binding:"required"`
}

type ManageVariantTypeResponse struct {
	ID    uint64 `json:"id,omitempty"`
	Type  string `json:"type" binding:"required"`
	Image string `json:"image,omitempty" binding:"url"`
}

type ManageVariantCombinationResponse struct {
	ID         uint64                     `json:"id,omitempty"`
	ParentType ManageVariantTypeResponse  `json:"parent_type" binding:"required"`
	ChildType  *ManageVariantTypeResponse `json:"child_type"`
	Price      string                     `json:"price" binding:"required"`
	Stock      uint64                     `json:"stock" binding:"required"`
}

type ManageCourierResponse struct {
	ID   uint64 `json:"id,omitempty"`
	Name string `json:"name" binding:"required"`
}

type PromoResponse struct {
	Id   uint64 `json:"id"`
	Name string `json:"name"`
}

type CheckPriceResponse struct {
	TotalPrice          string               `json:"total_price"`
	CutPrice            string               `json:"cut_price,omitempty"`
	Discount            string               `json:"discount,omitempty"`
	CuttedPrice         string               `json:"cutted_price,omitempty"`
	InitialPrice        string               `json:"initial_price,omitempty"`
	CheckPriceMerchants []CheckPriceMerchant `json:"merchant"`
}

type CheckPriceMerchant struct {
	MerchantId         uint64 `json:"merchant_id"`
	MerchantName       string `json:"merchant_name"`
	TotalPrice         string `json:"total_price"`
	CutPrice           string `json:"cut_price,omitempty"`
	CuttedPrice        string `json:"cutted_price,omitempty"`
	Discount           string `json:"discount,omitempty"`
	InitialPrice       string `json:"initial_price,omitempty"`
	Ongkir             string `json:"ongkir"`
	CheckPriceProducts []CheckPriceProduct
}

type CheckPriceProduct struct {
	ProductId    uint64 `json:"product_id"`
	ProductName  string `json:"product_name"`
	TotalPrice   string `json:"total_price"`
	CuttedPrice  string `json:"cutted_price,omitempty"`
	CutPrice     string `json:"cut_price,omitempty"`
	Discount     string `json:"discount,omitempty"`
	InitialPrice string `json:"initial_price,omitempty"`
}

type ListOrder struct {
	OrderId    uint64          `json:"order_id"`
	OrderPrice decimal.Decimal `json:"order_price"`
}
type ListTransaction struct {
	OrderId                     uint64          `json:"order_id"`
	OrderDetailId               uint64          `json:"order_detail_id"`
	OrderDetailProductId        uint64          `json:"order_detail_product_id"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	CourierId                   string          `json:"courier_id"`
	Invoice                     string          `json:"invoice"`
	MerchantId                  uint64          `json:"merchant_id"`
	Address                     string          `json:"address"`
	Status                      string          `json:"status"`
	EstimatedTime               time.Time       `json:"estimated_time"`
	OrderPrice                  decimal.Decimal `json:"order_price"`
	InitialPrice                decimal.Decimal `json:"initial_price"`
	FinalPrice                  decimal.Decimal `json:"final_price"`
	ProductPrice                decimal.Decimal `json:"product_price"`
	Quantity                    uint64          `json:"quantity"`
}

type ListTransactionResponse struct {
	OrderId              uint64                 `json:"order_id"`
	ListTransactionOrder []ListTransactionOrder `json:"merchant"`
	OrderPrice           decimal.Decimal        `json:"order_price"`
}

type ListTransactionOrder struct {
	OrderDetailId          uint64                   `json:"order_detail_id"`
	CourierId              string                   `json:"courier_id"`
	Invoice                string                   `json:"invoice"`
	MerchantId             uint64                   `json:"merchant_id"`
	MerchantName           string                   `json:"merchant_name"`
	Address                string                   `json:"address"`
	ListTransactionProduct []ListTransactionProduct `json:"product"`
	Status                 string                   `json:"status"`
	EstimatedTime          time.Time                `json:"estimated_time"`
	InitialPrice           decimal.Decimal          `json:"initial_price"`
	FinalPrice             decimal.Decimal          `json:"final_price"`
}

type ListTransactionProduct struct {
	OrderDetailProductId        uint64          `json:"order_detail_product_id"`
	ProductId                   uint64          `json:"product_id"`
	ProductName                 string          `json:"product_name"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	Photo                       string          `json:"photo"`
	Quantity                    uint64          `json:"quantity"`
	ProductPrice                decimal.Decimal `json:"product_price"`
	Status                      string          `json:"status,omitempty"`
	IsReviewed                  bool            `json:"is_reviewed"`
}

type ListSellerOrderId struct {
	OrderDetailId uint64 `json:"order_detail_id"`
}

type SellerOrderBuyerInformation struct {
	Id       uint64 `json:"id"`
	Username string `json:"username"`
}

type ListSellerOrder struct {
	OrderDetailId               uint64          `json:"order_id"`
	MerchantId                  uint64          `json:"merchant_id"`
	CourierId                   string          `json:"courier_id"`
	VoucherId                   uint64          `json:"voucher_id"`
	Status                      string          `json:"status"`
	EstimatedTime               time.Time       `json:"estimated_time"`
	Address                     string          `json:"address"`
	InitialPrice                decimal.Decimal `json:"initial_price"`
	FinalPrice                  decimal.Decimal `json:"final_price"`
	Invoice                     string          `json:"invoice"`
	OrderDetailProductId        uint64          `json:"order_detail_product_id"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	Quantity                    uint64          `json:"quantity"`
	ProductPrice                decimal.Decimal `json:"product_price"`
	Url                         string          `json:"product_photo"`
}

type ListSellerOrderResponse struct {
	OrderDetailId                uint64                         `json:"order_detail_id"`
	CourierId                    string                         `json:"courier_id"`
	Invoice                      string                         `json:"invoice"`
	Status                       string                         `json:"status"`
	UserId                       uint64                         `json:"user_id"`
	Username                     string                         `json:"username"`
	Address                      string                         `json:"address"`
	ListSellerTransactionProduct []ListSellerTransactionProduct `json:"product"`
	EstimatedTime                time.Time                      `json:"estimated_time"`
	InitialPrice                 decimal.Decimal                `json:"initial_price"`
	FinalPrice                   decimal.Decimal                `json:"final_price"`
}

type ListSellerTransactionProduct struct {
	ProductId                   uint64          `json:"product_id"`
	ProductName                 string          `json:"product_name"`
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	Photo                       string          `json:"photo"`
	Quantity                    uint64          `json:"quantity"`
	ProductPrice                decimal.Decimal `json:"product_price"`
}

type ListMerchantPromotionResponse struct {
	ID             uint64                 `json:"id"`
	Name           string                 `json:"name" binding:"required"`
	Banner         string                 `json:"banner"`
	PromotionType  string                 `json:"promotion_type" binding:"required"`
	PromotionScope string                 `json:"promotion_scope" binding:"required"`
	VoucherCode    string                 `json:"voucher_code" binding:"required"`
	Amount         string                 `json:"amount" binding:"required"`
	Quota          string                 `json:"quota" binding:"required"`
	MaxAmount      *string                `json:"max_amount"`
	Products       []ListProductsResponse `json:"products"`
	StartDate      string                 `json:"start_date" binding:"required"`
	EndDate        string                 `json:"end_date" binding:"required"`
	Status         string                 `json:"promotion_status" binding:"required"`
}
