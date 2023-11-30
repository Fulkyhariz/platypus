package model

import (
	"time"
)

type CategoriesLv1 struct {
	SeqId     string         `json:"sequence_id" gorm:"primarykey"`
	ID        string         `json:"id" gorm:"column:id"`
	Name      string         `json:"name" gorm:" column:name" binding:"required"`
	Category  *CategoriesLv2 `json:"category_lv_2,omitempty" gorm:"-"`
	CreatedAt time.Time      `json:"-" gorm:"column:created_at"`
	UpdatedAt time.Time      `json:"-" gorm:"column:updated_at"`
}

type CategoriesLv2 struct {
	SeqId         string         `json:"sequence_id" gorm:"primaryKey"`
	ID            string         `json:"id" gorm:"column:id"`
	Name          string         `json:"name" gorm:"column:name" binding:"required"`
	CategoryLv1Id string         `json:"category_lv_1_id,omitempty" gorm:"column:category_lv1_id" binding:"required"`
	Category      *CategoriesLv3 `json:"category_lv_3,omitempty" gorm:"-"`
	CreatedAt     time.Time      `json:"-" gorm:"column:created_at"`
	UpdatedAt     time.Time      `json:"-" gorm:"column:updated_at"`
}

type CategoriesLv3 struct {
	SeqId         string    `json:"sequence_id" gorm:"primaryKey"`
	ID            string    `json:"id" gorm:"column:id"`
	Name          string    `json:"name" gorm:"column:name" binding:"required"`
	CategoryLv2Id string    `json:"category_lv_2_id,omitempty" gorm:"column:category_lv2_id" binding:"required"`
	CreatedAt     time.Time `json:"-" gorm:"column:created_at"`
	UpdatedAt     time.Time `json:"-" gorm:"column:updated_at"`
}

type ListCategoriesLv1 struct {
	ID        string              `json:"id" gorm:"column:id"`
	Name      string              `json:"name" gorm:" column:name" binding:"required"`
	Icon      *string             `json:"icon" gorm:"column:category_icon"`
	Category  []ListCategoriesLv2 `json:"category_lv_2,omitempty" gorm:"-"`
	CreatedAt time.Time           `json:"-" gorm:"column:created_at"`
	UpdatedAt time.Time           `json:"-" gorm:"column:updated_at"`
}

type ListCategoriesLv2 struct {
	ID            string              `json:"id" gorm:"column:id"`
	Name          string              `json:"name" gorm:"column:name" binding:"required"`
	CategoryLv1Id string              `json:"category_lv_1_id,omitempty" gorm:"column:category_lv1_id" binding:"required"`
	Category      []ListCategoriesLv3 `json:"category_lv_3,omitempty" gorm:"-"`
	CreatedAt     time.Time           `json:"-" gorm:"column:created_at"`
	UpdatedAt     time.Time           `json:"-" gorm:"column:updated_at"`
}

type ListCategoriesLv3 struct {
	ID            string    `json:"id" gorm:"column:id"`
	Name          string    `json:"name" gorm:"column:name" binding:"required"`
	CategoryLv2Id string    `json:"category_lv_2_id,omitempty" gorm:"column:category_lv2_id" binding:"required"`
	CreatedAt     time.Time `json:"-" gorm:"column:created_at"`
	UpdatedAt     time.Time `json:"-" gorm:"column:updated_at"`
}

type ListMerchantCategories struct {
	ID            string `json:"id" gorm:"column:category_id"`
	Category      string `json:"category" gorm:"column:category"`
	TotalProducts uint64 `json:"total_products"`
}
