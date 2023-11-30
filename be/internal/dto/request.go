package dto

import (
	"digital-test-vm/be/internal/shared"

	"github.com/shopspring/decimal"
)

type RegisterUserRequest struct {
	Username    string `json:"username" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required"`
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required,e164"`
	Gender      string `json:"gender" binding:"required"`
	DateOfBirth string `json:"date_of_birth" binding:"required" time_format:"02/01/2006"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterMerchantRequest struct {
	MerchantName string `json:"merchant_name" binding:"required"`
}

type EditAddressRequest struct {
	ID             uint64 `json:"id" binding:"required"`
	Name           string `json:"name" binding:"required"`
	PhoneNumber    string `json:"phone_number" binding:"e164"`
	Province       string `json:"province" binding:"required"`
	ProvinceCode   uint64 `json:"province_code" binding:"required"`
	District       string `json:"district" binding:"required"`
	DistrictCode   uint64 `json:"district_code" binding:"required"`
	SubDistrict    string `json:"sub_district" binding:"required"`
	SubSubDistrict string `json:"sub_sub_district" binding:"required"`
	ZipCode        uint64 `json:"zip_code" binding:"required"`
	Details        string `json:"details"`
}

type AddAddressRequest struct {
	Name           string `json:"name" binding:"required"`
	PhoneNumber    string `json:"phone_number" binding:"e164"`
	Province       string `json:"province" binding:"required"`
	ProvinceCode   uint64 `json:"province_code" binding:"required"`
	District       string `json:"district" binding:"required"`
	DistrictCode   uint64 `json:"district_code" binding:"required"`
	SubDistrict    string `json:"sub_district" binding:"required"`
	SubSubDistrict string `json:"sub_sub_district" binding:"required"`
	ZipCode        uint64 `json:"zip_code" binding:"required"`
	Details        string `json:"details"`
}

type SetDefaultAddressRequest struct {
	AddressId uint64 `json:"address_id" binding:"required"`
}

type VerifyPasswordCodeRequest struct {
	Code string `json:"code" binding:"required"`
}

type ChangePasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ProductFavoriteRequest struct {
	ProductId uint64 `json:"product_id" binding:"required"`
}

type ChangeEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ChangePhotoProfileRequest struct {
	PhotoProfile string `json:"photo_profile" binding:"required"`
}

type ListProductQueries struct {
	Keyword   string
	Limit     uint64
	Page      uint64
	SortBy    string
	SortOrder string
	Category  string
	MaxPrice  decimal.Decimal
	MinPrice  decimal.Decimal
	MinRating uint64
	Locations []uint64
}

type ListProductByMerchantQueries struct {
	Keyword          string
	Limit            uint64
	Page             uint64
	SortBy           string
	SortOrder        string
	Category         string
	ExcludeNoStock   bool
	ExcludeNotActive bool
}

type AddProductToCartRequest struct {
	VariantCombinationProductId uint64 `json:"variant_combination_product_id" binding:"required"`
	Stock                       uint64 `json:"stock" binding:"required"`
}

type DeleteProductFromCartRequest struct {
	ID uint64 `json:"cart_product_id" binding:"required"`
}

type GetProductReviewRequest struct {
	ProductId uint64 `json:"product_id" binding:"required"`
	Rating    uint64 `json:"rating" binding:"required"`
	Page      int    `json:"page"`
	Order     string `json:"order"`
	Limit     int    `json:"limit"`
	Images    string `json:"images"`
	Comments  string `json:"comments"`
}

type CreateProductReviewRequest struct {
	ProductId     uint64 `json:"product_id" binding:"required"`
	OrderDetailId uint64 `json:"order_detail_id" binding:"required"`
	Rating        uint64 `json:"rating" binding:"required"`
	Comments      string `json:"comments"`
	Images        string `json:"images"`
}

type DeactivateProductRequest struct {
	ProductId uint64 `json:"product_id" binding:"required"`
}

type CreateWalletRequest struct {
	Pin string `json:"pin" binding:"required,len=6,numeric"`
}

type ValidateChangePinRequest struct {
	Password string `json:"password" binding:"required"`
}

type ChangePinRequest struct {
	Pin string `json:"pin" binding:"required,len=6,numeric"`
}

type TopUpRequest struct {
	Amount uint `json:"amount" binding:"required,min=10000,max=2000000"`
}

type DeleteAddressRequest struct {
	AddressId uint `json:"address_id"`
}

type OrderStatus struct {
	OrderStatus string `gorm:"column:order_status"`
}

type ListTransactionRequest struct {
	Status string `json:"status"`
	Page   uint64 `json:"page"`
}

type ListSellerTransactionRequest struct {
	Status string `json:"status"`
	Page   uint64 `json:"page"`
}

type AddQuantityToCartRequest struct {
	Id       uint64 `json:"cart_product_id"`
	Quantity uint64 `json:"quantity"`
}

type DecreasedQuantityToCartRequest struct {
	Id       uint64 `json:"cart_product_id"`
	Quantity uint64 `json:"quantity"`
}

type ManageProductRequest struct {
	ID            uint64                      `json:"id,omitempty"`
	Title         string                      `json:"title" binding:"required"`
	Photos        []ManageProductPhotoRequest `json:"photos" binding:"required"`
	Video         string                      `json:"video"`
	Description   string                      `json:"description" binding:"required"`
	Length        string                      `json:"length" binding:"required,numeric"`
	Width         string                      `json:"width" binding:"required,numeric"`
	Height        string                      `json:"height" binding:"required,numeric"`
	Weight        string                      `json:"weight" binding:"required,numeric"`
	IsUsed        bool                        `json:"is_used" binding:"boolean"`
	IsHazardous   bool                        `json:"is_hazardous" binding:"boolean"`
	CategoryLV1ID string                      `json:"category_lv1_id" binding:"required"`
	CategoryLV2ID string                      `json:"category_lv2_id"`
	CategoryLV3ID string                      `json:"category_lv3_id"`
	Variants      ManageVariantRequest        `json:"variants" binding:"required"`
}

func (r *ManageProductRequest) ToDTO() (*ManageProduct, error) {
	photos := []ManageProductPhoto{}
	for _, pr := range r.Photos {
		photos = append(photos, *pr.ToDTO())
	}

	length, err := decimal.NewFromString(r.Length)
	if err != nil {
		return nil, err
	}

	width, err := decimal.NewFromString(r.Width)
	if err != nil {
		return nil, err
	}

	height, err := decimal.NewFromString(r.Height)
	if err != nil {
		return nil, err
	}

	weight, err := decimal.NewFromString(r.Weight)
	if err != nil {
		return nil, err
	}

	variants, err := r.Variants.ToDTO()
	if err != nil {
		return nil, err
	}

	return &ManageProduct{
		ID:            r.ID,
		Title:         r.Title,
		Photos:        photos,
		Video:         r.Video,
		Description:   r.Description,
		Length:        length,
		Width:         width,
		Height:        height,
		Weight:        weight,
		IsUsed:        r.IsUsed,
		IsHazardous:   r.IsHazardous,
		CategoryLV1ID: r.CategoryLV1ID,
		CategoryLV2ID: r.CategoryLV2ID,
		CategoryLV3ID: r.CategoryLV3ID,
		Variants:      *variants,
	}, nil
}

type ManageProductPhotoRequest struct {
	ID        uint64 `json:"id,omitempty"`
	URL       string `json:"url" binding:"required,url"`
	IsDefault bool   `json:"is_default" binding:"required,boolean"`
}

func (r *ManageProductPhotoRequest) ToDTO() *ManageProductPhoto {
	return &ManageProductPhoto{
		ID:        r.ID,
		URL:       r.URL,
		IsDefault: r.IsDefault,
	}
}

type ManageVariantRequest struct {
	ID           uint64                            `json:"id,omitempty"`
	Parent       ManageVariantGroupRequest         `json:"parent" binding:"required"`
	Child        *ManageVariantGroupRequest        `json:"child"`
	Combinations []ManageVariantCombinationRequest `json:"combinations" binding:"required"`
}

func (r *ManageVariantRequest) ToDTO() (*ManageVariant, error) {
	combinations := []ManageVariantCombination{}
	for _, vcr := range r.Combinations {
		vc, err := vcr.ToDTO()
		if err != nil {
			return nil, err
		}
		combinations = append(combinations, *vc)
	}
	mv := &ManageVariant{
		Parent:       *r.Parent.ToDTO(),
		Combinations: combinations,
	}
	if r.Child != nil {
		mv.Child = r.Child.ToDTO()
	}
	return mv, nil
}

type ManageVariantGroupRequest struct {
	ID    uint64                     `json:"id,omitempty"`
	Group string                     `json:"group" binding:"required"`
	Types []ManageVariantTypeRequest `json:"types" binding:"required"`
}

func (r *ManageVariantGroupRequest) ToDTO() *ManageVariantGroup {
	types := []ManageVariantType{}
	for _, vtr := range r.Types {
		types = append(types, *vtr.ToDTO())
	}
	return &ManageVariantGroup{
		ID:    r.ID,
		Group: r.Group,
		Types: types,
	}
}

type ManageVariantTypeRequest struct {
	ID    uint64 `json:"id,omitempty"`
	Type  string `json:"type" binding:"required"`
	Image string `json:"image,omitempty" binding:"url"`
}

func (r *ManageVariantTypeRequest) ToDTO() *ManageVariantType {
	return &ManageVariantType{
		ID:    r.ID,
		Type:  r.Type,
		Image: r.Image,
	}
}

type ManageVariantCombinationRequest struct {
	ID         uint64                   `json:"id,omitempty"`
	ParentType ManageVariantTypeRequest `json:"parent_type" binding:"required"`
	ChildType  ManageVariantTypeRequest `json:"child_type"`
	Price      string                   `json:"price" binding:"required"`
	Stock      uint64                   `json:"stock" binding:"required"`
}

func (r *ManageVariantCombinationRequest) ToDTO() (*ManageVariantCombination, error) {
	price, err := decimal.NewFromString(r.Price)
	if err != nil {
		return nil, err
	}
	return &ManageVariantCombination{
		ID:         r.ID,
		ParentType: *r.ParentType.ToDTO(),
		ChildType:  r.ChildType.ToDTO(),
		Price:      price,
		Stock:      r.Stock,
	}, nil
}

type MerchantCheckoutRequest struct {
	MerchantId   uint64 `json:"merchant_id" binding:"required"`
	CourierId    string `json:"courier_id" binding:"required"`
	CourierPrice string `json:"courier_price" binding:"required"`
}

type CheckoutRequest struct {
	CartId    uint64                    `json:"cart_id" binding:"required"`
	Merchant  []MerchantCheckoutRequest `json:"merchant" binding:"required"`
	AddressId uint64                    `json:"address_id" binding:"required"`
	VoucherId *uint64                   `json:"voucher_id"`
}

type ChangeStatusOrderRequest struct {
	OrderDetailId uint64 `json:"order_detail_id"`
}

type ManagePromotionRequest struct {
	ID             uint64   `json:"id"`
	Name           string   `json:"name" binding:"required"`
	Banner         string   `json:"banner"`
	PromotionType  string   `json:"promotion_type" binding:"required"`
	PromotionScope string   `json:"promotion_scope" binding:"required"`
	VoucherCode    string   `json:"voucher_code" binding:"required"`
	Amount         string   `json:"amount" binding:"required"`
	Quota          string   `json:"quota" binding:"required"`
	MaxAmount      string   `json:"max_amount"`
	Products       []uint64 `json:"products"`
	StartDate      string   `json:"start_date" binding:"required"`
	EndDate        string   `json:"end_date" binding:"required"`
}

type ListPromotionQueries struct {
	Status shared.PromotionStatus
	Limit  uint64
	Page   uint64
}

type IsReviewRequest struct {
	OrderDetailId uint64 `json:"order_detail_id"`
	ProductId     uint64 `json:"product_id"`
}

type IsReviewResponse struct {
	IsReview bool `json:"is_review"`
}
