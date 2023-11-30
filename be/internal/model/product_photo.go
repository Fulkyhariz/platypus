package model

import "time"

type ProductPhoto struct {
	Id        uint64     `json:"id"`
	IsDefault bool       `json:"is_default" gorm:"default:false"`
	ProductId uint64     `json:"product_id"`
	Url       string     `json:"url"`
	CreatedAt time.Time  `gorm:"column:created_at"`
	UpdatedAt time.Time  `gorm:"column:updated_at"`
	DeletedAt *time.Time `gorm:"column:deleted_at"`
}

type ProductPhotoOrder struct {
	Id                   uint64     `json:"id"`
	IsDefault            bool       `json:"is_default" gorm:"default:false"`
	OrderDetailProductId uint64     `json:"order_detail_product_id"`
	Url                  string     `json:"url"`
	CreatedAt            time.Time  `gorm:"column:created_at"`
	UpdatedAt            time.Time  `gorm:"column:updated_at"`
	DeletedAt            *time.Time `gorm:"column:deleted_at"`
}

type ProductReviewPhoto struct {
	Id              uint64     `json:"id"`
	ProductReviewId uint64     `json:"product_review_id"`
	Url             string     `json:"url"`
	CreatedAt       time.Time  `gorm:"column:created_at"`
	UpdatedAt       time.Time  `gorm:"column:updated_at"`
	DeletedAt       *time.Time `gorm:"column:deleted_at"`
}
