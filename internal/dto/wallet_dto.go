package dto

import (
	"digital-test-vm/be/internal/model"

	"github.com/shopspring/decimal"
)

type Wallet struct {
	ID       uint64          `json:"column:id"`
	WalletId string          `json:"wallet_id"`
	UserId   uint64          `json:"user_id"`
	Balance  decimal.Decimal `json:"balance"`
	Pin      string          `json:"pin"`
}

func ToWalletDTO(w *model.Wallet) *Wallet {
	return &Wallet{
		ID:       w.ID,
		WalletId: w.WalletId,
		UserId:   w.UserId,
		Balance:  w.Balance,
		Pin:      w.Pin,
	}
}
