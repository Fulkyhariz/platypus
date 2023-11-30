package repo

import (
	"digital-test-vm/be/internal/shared"
	"errors"

	"gorm.io/gorm"
)

var (
	ErrAlreadyDefaultAddress = errors.New("address already set as default")
	ErrAlreadyShopAddress    = errors.New("address already set as default")
	ErrNoDefault             = errors.New("user don't have default address")
	ErrCartProductNotFound   = errors.New(shared.ErrCartProductNotFound.Message)
	ErrUnauthorizedAccess    = errors.New(shared.ErrUnauthorizedAccess.Message)
	ErrInternalServerError   = errors.New(shared.ErrInternalServerError.Message)
	ErrMerchantNotFound      = errors.New(shared.ErrMerchantNotFound.Message)
	ErrDislikeProduct        = errors.New(shared.ErrDislikeProduct.Message)
	ErrAlreadyRegistered     = errors.New("email or username already used")
	ErrUserNotFound          = gorm.ErrRecordNotFound
	ErrWalletAlreadyCreated  = errors.New("wallet already created")
	ErrWalletNotFound        = errors.New("wallet not found")
	ErrOrderDetailNotFound   = errors.New(shared.ErrOrderDetailNotFound.Message)
	ErrOrderNotFound         = errors.New(shared.ErrOrderNotFound.Message)
)
