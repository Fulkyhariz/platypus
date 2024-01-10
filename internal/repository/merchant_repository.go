package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var ErrNotHaveAddress = errors.New("user don't have address")

type merchantRepo struct {
	db *gorm.DB
}

type MerchantRepo interface {
	FindMerchantByID(ctx context.Context, merchantID uint64) (*model.Merchant, error)
	GetMerchantId(c context.Context, id int) (*model.Merchant, error)
	IsMerchantExist(c context.Context, merchantId uint64) (*model.Merchant, error)

	CreateMerchant(ctx context.Context, merchant *model.Merchant) (*model.Merchant, error)
	FindMerchantByUserID(ctx context.Context, userId uint64) (*model.Merchant, error)
	GetMerchantByUserId(c context.Context, userId uint64) (*model.Merchant, error)
}

func NewMerchantRepo(db *gorm.DB) MerchantRepo {
	return &merchantRepo{
		db: db,
	}
}

func (ur *merchantRepo) FindMerchantByUserID(ctx context.Context, userId uint64) (*model.Merchant, error) {
	var merchant model.Merchant
	err := ur.db.WithContext(ctx).Where("user_id = ?", userId).First(&merchant).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = ErrMerchantNotFound
		}
		return nil, fmt.Errorf("merchantRepo/FindMerchantByUser: %w", err)
	}
	return &merchant, nil
}

// create default variant
func (ur *merchantRepo) CreateMerchant(ctx context.Context, merchant *model.Merchant) (*model.Merchant, error) {
	var user model.User
	var address model.Address
	tx := ur.db.WithContext(ctx).Begin()
	defer tx.Rollback()
	err := tx.Model(&user).Where("id = ?", merchant.UserID).Update("is_seller", true).Error
	if err != nil {
		return nil, fmt.Errorf("error userRepo/CreateMerchant: %w", err)
	}
	err = tx.Create(merchant).Error
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("error userRepo/CreateMerchant: %w", err)
		}
		return nil, err
	}
	err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", merchant.UserID).Where("is_default = ?", true).First(&address).Error
	if err != nil {
		return nil, fmt.Errorf("error userRepo/CreateMerchant: %w", ErrNotHaveAddress)
	}
	address.IsShopLocation = true
	err = tx.Save(address).Error
	if err != nil {
		return nil, fmt.Errorf("error userRepo/CreateMerchant: %w", err)
	}
	tx.Commit()
	return merchant, nil
}

func (r *merchantRepo) FindMerchantByID(ctx context.Context, merchantID uint64) (*model.Merchant, error) {
	var merchant model.Merchant
	err := r.db.WithContext(ctx).
		Where("id = ?", merchantID).
		First(&merchant).
		Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = ErrMerchantNotFound
		}
		return nil, fmt.Errorf("merchantRepo/FindMerchantByID: %w", err)
	}
	return &merchant, err
}

func (r *merchantRepo) GetMerchantId(c context.Context, id int) (*model.Merchant, error) {
	result := model.Merchant{}
	err := r.db.WithContext(c).Model(model.Merchant{}).Where("id=?", id).First(&result).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		return nil, fmt.Errorf("merchantRepo/GetMerchantId %w", ErrInternalServerError)
	}
	return &result, nil

}

func (r *merchantRepo) IsMerchantExist(c context.Context, merchantId uint64) (*model.Merchant, error) {
	result := model.Merchant{}
	err := r.db.WithContext(c).Model(model.Merchant{}).Where("id=?", merchantId).First(&result).Error
	if err != nil {
		return nil, fmt.Errorf("merchantRepo/IsMerchantExist %w", ErrMerchantNotFound)
	}
	return &result, nil
}

func (r *merchantRepo) GetMerchantByUserId(c context.Context, userId uint64) (*model.Merchant, error) {
	result := model.Merchant{}
	if err := r.db.WithContext(c).Model(&model.Merchant{}).Where("user_id=?", userId).First(&result).Error; err != nil {
		return nil, fmt.Errorf("merchantRepo/GetMerchantByUserId %w", ErrMerchantNotFound)
	}
	return &result, nil
}
