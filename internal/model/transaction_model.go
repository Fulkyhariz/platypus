package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type Transaction struct {
	ID          uint64          `gorm:"column:id"`
	WalletId    string          `gorm:"column:wallet_id"`
	RecipientId string          `gorm:"column:recipient_id"`
	SenderId    *string         `gorm:"column:sender_id"`
	Amount      decimal.Decimal `gorm:"column:amount"`
	Description *string         `gorm:"column:description"`
	CreatedAt   time.Time       `gorm:"column:created_at"`
	UpdatedAt   time.Time       `gorm:"column:updated_at"`
	DeletedAt   *time.Time      `gorm:"column:deleted_at"`
}

type Payment struct {
	ID              uint64     `gorm:"column:id"`
	WalletHistoryId uint64     `gorm:"column:wallet_history_id"`
	OrderDetailId   uint64     `gorm:"column:order_detail_id"`
	PaymentDate     time.Time  `gorm:"column:payment_date"`
	CreatedAt       time.Time  `gorm:"column:created_at"`
	UpdatedAt       time.Time  `gorm:"column:updated_at"`
	DeletedAt       *time.Time `gorm:"column:deleted_at"`
}
