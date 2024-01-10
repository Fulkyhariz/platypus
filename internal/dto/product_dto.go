package dto

import (
	"digital-test-vm/be/internal/model"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

type Product struct {
	ID            uint64
	MerchantId    uint64
	Title         string
	Photos        []string
	Video         string
	Description   string
	Length        float64
	Width         float64
	Height        float64
	Weight        float64
	IsUsed        bool
	IsHazardous   bool
	TotalSold     uint64
	FavCount      uint64
	AverageRating float64
	TotalStock    uint64
	IsFavorite    bool
	IsActive      bool
	CategoryLv1Id string
	CategoryLv2Id string
	CategoryLv3Id string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type ListProduct struct {
	ID            uint64
	MerchantId    uint64
	Username      string
	Title         string
	Photo         string
	TotalSold     uint64
	FavCount      uint64
	AverageRating float64
	TotalStock    uint64
	City          string
	CategoryLv1Id string
	CategoryLv2Id string
	CategoryLv3Id string
	MinPrice      decimal.Decimal
	IsActive      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func ProductToDTO(product model.Product) *Product {
	return &Product{
		ID:            product.ID,
		MerchantId:    product.MerchantId,
		Title:         product.Title,
		Video:         product.Video,
		Description:   product.Description,
		Length:        product.Length,
		Width:         product.Width,
		Height:        product.Height,
		Weight:        product.Weight,
		IsUsed:        product.IsUsed,
		IsHazardous:   product.IsHazardous,
		TotalSold:     product.TotalSold,
		IsFavorite:    product.IsFavorite,
		IsActive:      product.IsActive,
		CategoryLv1Id: product.CategoryLv1Id,
		CategoryLv2Id: product.CategoryLv2Id,
		CategoryLv3Id: product.CategoryLv3Id,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}
}

func ListProductToDTO(product model.ListProduct) *ListProduct {
	return &ListProduct{
		ID:            product.ID,
		MerchantId:    product.MerchantId,
		Username:      product.Username,
		Title:         product.Title,
		Photo:         product.Photo,
		TotalSold:     product.TotalSold,
		FavCount:      product.FavCount,
		TotalStock:    product.TotalStock,
		City:          product.City,
		AverageRating: product.AverageRating,
		CategoryLv1Id: product.CategoryLv1Id,
		CategoryLv2Id: product.CategoryLv2Id,
		CategoryLv3Id: product.CategoryLv3Id,
		MinPrice:      product.MinPrice,
		IsActive:      product.IsActive,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}
}

func (lp *ListProduct) ToResponse() *ListProductsResponse {
	return &ListProductsResponse{
		ID:            lp.ID,
		MerchantId:    lp.MerchantId,
		Username:      lp.Username,
		Title:         lp.Title,
		Photo:         lp.Photo,
		TotalSold:     lp.TotalSold,
		FavCount:      lp.FavCount,
		AverageRating: lp.AverageRating,
		TotalStock:    lp.TotalStock,
		City:          lp.City,
		CategoryLv1Id: lp.CategoryLv1Id,
		CategoryLv2Id: lp.CategoryLv2Id,
		CategoryLv3Id: lp.CategoryLv3Id,
		MinPrice:      lp.MinPrice,
		IsActive:      lp.IsActive,
		CreatedAt:     lp.CreatedAt,
		UpdatedAt:     lp.UpdatedAt,
	}
}

type ManageProduct struct {
	ID            uint64
	Title         string
	Photos        []ManageProductPhoto
	Video         string
	Description   string
	Length        decimal.Decimal
	Width         decimal.Decimal
	Height        decimal.Decimal
	Weight        decimal.Decimal
	IsUsed        bool
	IsHazardous   bool
	CategoryLV1ID string
	CategoryLV2ID string
	CategoryLV3ID string
	Variants      ManageVariant
}

func ModelToManageProduct(product *model.Product) *ManageProduct {
	return &ManageProduct{
		ID:            product.ID,
		Title:         product.Title,
		Video:         product.Video,
		Description:   product.Description,
		Length:        decimal.NewFromFloat(product.Length),
		Width:         decimal.NewFromFloat(product.Width),
		Height:        decimal.NewFromFloat(product.Height),
		Weight:        decimal.NewFromFloat(product.Weight),
		IsUsed:        product.IsUsed,
		IsHazardous:   product.IsHazardous,
		CategoryLV1ID: product.CategoryLv1Id,
		CategoryLV2ID: product.CategoryLv2Id,
		CategoryLV3ID: product.CategoryLv3Id,
	}
}

func (mp *ManageProduct) ToProductModel() *model.Product {
	return &model.Product{
		Title:         mp.Title,
		Video:         mp.Video,
		Description:   mp.Description,
		Length:        mp.Length.InexactFloat64(),
		Width:         mp.Width.InexactFloat64(),
		Height:        mp.Height.InexactFloat64(),
		Weight:        mp.Weight.InexactFloat64(),
		IsUsed:        mp.IsUsed,
		IsHazardous:   mp.IsHazardous,
		CategoryLv1Id: strings.ToUpper(mp.CategoryLV1ID),
		CategoryLv2Id: strings.ToUpper(mp.CategoryLV2ID),
		CategoryLv3Id: strings.ToUpper(mp.CategoryLV3ID),
	}
}

func (mp *ManageProduct) ToResponse() *ManageProductResponse {
	photos := []ManageProductPhotoResponse{}
	for _, p := range mp.Photos {
		photos = append(photos, *p.ToResponse())
	}

	return &ManageProductResponse{
		ID:            mp.ID,
		Title:         mp.Title,
		Photos:        photos,
		Video:         mp.Video,
		Description:   mp.Description,
		Length:        mp.Length.String(),
		Width:         mp.Length.String(),
		Height:        mp.Height.String(),
		Weight:        mp.Weight.String(),
		IsUsed:        mp.IsUsed,
		IsHazardous:   mp.IsHazardous,
		CategoryLV1ID: mp.CategoryLV1ID,
		CategoryLV2ID: mp.CategoryLV2ID,
		CategoryLV3ID: mp.CategoryLV3ID,
		Variants:      *mp.Variants.ToResponse(),
	}
}
