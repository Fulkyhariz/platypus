package model

import (
	"database/sql"
	"time"
)

type ProductReview struct {
	ID            uint64
	ProductId     uint64
	Product       Product `gorm:"-"`
	UserId        uint64
	User          User `gorm:"-"`
	OrderDetailId uint64
	Rating        uint64
	Description   string       `gorm:"default:null"`
	Photos        string      `gorm:"default:null"`
	CreatedAt     time.Time    `json:"created_at" gorm:"default:now()"`
	UpdatedAt     time.Time    `json:"updated_at" gorm:"default:now()"`
	DeletedAt     sql.NullTime `json:"-" gorm:"default:null"`
}
