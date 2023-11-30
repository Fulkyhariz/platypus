package model

import (
	"database/sql"
	"time"
)

type ProductFavorites struct {
	ID        uint64       `json:"id" gorm:"primarykey"`
	UserId    uint64       `json:"user_id" binding:"required"`
	ProductId uint64       `json:"product_id" binding:"required"`
	CreatedAt time.Time    `json:"created_at" gorm:"default:now()"`
	UpdatedAt time.Time    `json:"updated_at" gorm:"default:now()"`
	DeletedAt sql.NullTime `json:"-" gorm:"default:null"`
}
