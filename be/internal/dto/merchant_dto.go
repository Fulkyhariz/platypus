package dto

import (
	"digital-test-vm/be/internal/model"
	"time"
)

type Merchant struct {
	ID          uint64
	Name        string
	PhoneNumber string
	Rating      float32
	OpeningDate time.Time
	UserID      uint64
	Username    *string
	Photo       string
	Banner      string
	Address     *Address
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func MerchantToDTO(merchant model.Merchant) *Merchant {
	return &Merchant{
		ID:          merchant.ID,
		Name:        merchant.Name,
		PhoneNumber: merchant.PhoneNumber,
		Rating:      merchant.Rating,
		OpeningDate: merchant.OpeningDate,
		UserID:      merchant.UserID,
		Photo:       merchant.Photo,
		Banner:      merchant.Banner,
		CreatedAt:   merchant.CreatedAt,
		UpdatedAt:   merchant.UpdatedAt,
	}
}

func (m *Merchant) ToResponse() *MerchantResponse {
	return &MerchantResponse{
		ID:          m.ID,
		Name:        m.Name,
		PhoneNumber: m.PhoneNumber,
		Rating:      m.Rating,
		OpeningDate: m.OpeningDate,
		UserID:      m.UserID,
		Username:    *m.Username,
		Photo:       m.Photo,
		Banner:      m.Banner,
		Address:     m.Address,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
