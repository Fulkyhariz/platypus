package model

import (
	"time"
)

type Merchant struct {
	ID          uint64     `json:"id" gorm:"column:id"`
	Name        string     `json:"name" gorm:"column:name" binding:"required"`
	PhoneNumber string     `json:"phone_number" gorm:"column:phone_number"`
	Rating      float32    `json:"rating" gorm:"column:rating" binding:"required"`
	OpeningDate time.Time  `json:"opening_date" gorm:"column:opening_date" binding:"required"`
	UserID      uint64     `json:"user_id" gorm:"column:user_id"`
	Photo       string     `json:"photo" gorm:"column:photo"`
	Banner      string     `json:"banner" gorm:"column:banner"`
	CreatedAt   time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"column:updated_at"`
	DeletedAt   *time.Time `json:"deleted_at" gorm:"column:deleted_at"`
}
