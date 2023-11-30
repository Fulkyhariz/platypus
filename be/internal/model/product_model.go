package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Product struct {
	ID            uint64        `json:"id" gorm:"primarykey"`
	MerchantId    uint64        `json:"merchant_id" binding:"required"`
	Merchant      Merchant      `gorm:"-"`
	Title         string        `json:"title" binding:"required"`
	Photo         []string      `gorm:"-"`
	Video         string        `json:"video" gorm:"default:null"`
	Description   string        `json:"description" binding:"required"`
	Length        float64       `json:"length" gorm:"default:0"`
	Width         float64       `json:"width" gorm:"default:0"`
	Height        float64       `json:"height" gorm:"default:0"`
	Weight        float64       `json:"weight" gorm:"default:0"`
	IsUsed        bool          `json:"is_used" gorm:"default:false"`
	IsHazardous   bool          `json:"is_hazardous" gorm:"default:false"`
	TotalSold     uint64        `json:"total_sold" gorm:"default:0"`
	FavCount      uint64        `json:"favorite_count" gorm:"default:0"`
	AverageRating float64       `json:"average_rating" gorm:"default:0"`
	TotalRating   uint64        `json:"total_rating" gorm:"default:0"`
	TotalStock    uint64        `json:"total_stock" gorm:"default:0"`
	IsFavorite    bool          `json:"is_favorite" gorm:"-"`
	IsActive      bool          `json:"is_active" gorm:"default:true"`
	CategoryLv1Id string        `json:"category_lv1_id" binding:"required"`
	CategoryLv2Id string        `json:"category_lv2_id" gorm:"default:null"`
	CategoryLv3Id string        `json:"category_lv3_id" gorm:"default:null"`
	Category      CategoriesLv1 `gorm:"-"`
	CreatedAt     time.Time     `json:"created_at" gorm:"default:now()"`
	UpdatedAt     time.Time     `json:"updated_at" gorm:"default:now()"`
	DeletedAt     *time.Time    `json:"deleted_at" gorm:"default:null"`
}

type ListProduct struct {
	ID            uint64 `json:"id" gorm:"primarykey"`
	MerchantId    uint64 `json:"merchant_id" binding:"required"`
	Username      string
	Title         string          `json:"title" binding:"required"`
	Photo         string          `json:"photo" binding:"required"`
	TotalSold     uint64          `json:"total_sold" gorm:"default:0"`
	FavCount      uint64          `json:"favorite_count" gorm:"default:0"`
	AverageRating float64         `json:"average_rating" gorm:"default:0"`
	TotalStock    uint64          `json:"total_stock" gorm:"default:0"`
	City          string          `json:"city"`
	CategoryLv1Id string          `json:"category_lv1_id" binding:"required"`
	CategoryLv2Id string          `json:"category_lv2_id"`
	CategoryLv3Id string          `json:"category_lv3_id"`
	MinPrice      decimal.Decimal `json:"min_price"`
	IsActive      bool            `json:"is_active"`
	CreatedAt     time.Time       `json:"created_at" gorm:"default:now()"`
	UpdatedAt     time.Time       `json:"updated_at" gorm:"default:now()"`
}
