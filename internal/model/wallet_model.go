package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Wallet struct {
	ID        uint64          `gorm:"column:id"`
	WalletId  string          `gorm:"column:wallet_id"`
	UserId    uint64          `gorm:"column:user_id"`
	Balance   decimal.Decimal `gorm:"column:balance"`
	Pin       string          `gorm:"column:pin"`
	CreatedAt time.Time       `gorm:"column:created_at"`
	UpdatedAt time.Time       `gorm:"column:updated_at"`
	DeletedAt *time.Time      `gorm:"column:deleted_at"`
}

type WalletHistory struct {
	Id          uint64          `gorm:"column:id"`
	WalletId    uint64          `gorm:"column:wallet_id"`
	RecipientId uint64          `gorm:"column:recipient_id"`
	SenderId    *uint64         `gorm:"column:sender_id"`
	Amount      decimal.Decimal `gorm:"column:amount"`
	Description string          `gorm:"column:description"`
	CreatedAt   time.Time       `gorm:"column:created_at"`
	UpdatedAt   time.Time       `gorm:"column:updated_at"`
	DeletedAt   *time.Time      `gorm:"column:deleted_at"`
}
