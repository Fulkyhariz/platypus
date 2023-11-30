package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Promotion struct {
	ID             uint64
	Banner         string `gorm:"default:null"`
	Name           string `gorm:"column:promo_name"`
	PromotionType  string
	PromotionScope string
	VoucherCode    string
	Amount         float64
	Quota          uint64
	MaxAmount      *decimal.Decimal
	StartDate      time.Time
	EndDate        time.Time
	Products       []ListProduct `gorm:"-"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      *time.Time `gorm:"default:null"`
}

type MerchantProductPromotion struct {
	ID          uint64
	MerchantID  uint64 `gorm:"default:null"`
	ProductID   uint64 `gorm:"default:null"`
	PromotionID uint64
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time `gorm:"default:null"`
}
