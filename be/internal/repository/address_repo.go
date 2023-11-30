package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type addressRepo struct {
	db    *gorm.DB
	redis *redis.Client
}

type AddressRepo interface {
	Create(ctx context.Context, address *model.Address) (*model.Address, error)
	Update(ctx context.Context, address *model.Address) (*model.Address, error)
	FindByUserId(ctx context.Context, address *model.Address) (*model.Address, error)
	UpdateDefault(ctx context.Context, userId uint64, addressId uint64, update shared.AddressToUpdate) error
	FindById(ctx context.Context, address *model.Address) (*model.Address, error)
	FindMerchantAddressByUserID(ctx context.Context, address *model.Address) (*model.Address, error)
	FindAll(ctx context.Context, userId uint64) ([]model.Address, error)
	FindAddressByUserId(ctx context.Context, userId uint64) (*model.Address, error)

	DeleteAddressById(ctx context.Context, addressId uint64) error
}

func (a *addressRepo) DeleteAddressById(ctx context.Context, addressId uint64) error {
	var address model.Address
	err := a.db.WithContext(ctx).Where("id = ?", addressId).Delete(&address).Error
	if err != nil {
		return fmt.Errorf("error addressRepo/DeleteAddressById: %w", err)
	}
	return nil
}

func (a *addressRepo) FindAll(ctx context.Context, userId uint64) ([]model.Address, error) {
	var addresses []model.Address
	err := a.db.WithContext(ctx).Where("user_id = ?", userId).Find(&addresses).Error
	if err != nil {
		return nil, fmt.Errorf("error addressRepo/FindAll: %w", err)
	}
	return addresses, nil
}

func (a *addressRepo) Create(ctx context.Context, address *model.Address) (*model.Address, error) {
	tx := a.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Create(address).Error
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("error addressRepo/Create: %w", err)
		}
		return nil, err
	}
	tx.Commit()
	return address, nil
}

func (a *addressRepo) Update(ctx context.Context, address *model.Address) (*model.Address, error) {
	var oldAddress model.Address

	tx := a.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", address.ID).First(&oldAddress).Error
	if err != nil {
		return nil, fmt.Errorf("error addressRepo/Update: %w", err)
	}

	oldAddress.UpdatedAt = time.Now()
	oldAddress.PhoneNumber = address.PhoneNumber
	oldAddress.Name = address.Name
	oldAddress.Province = address.Province
	oldAddress.ProvinceCode = address.ProvinceCode
	oldAddress.District = address.District
	oldAddress.DistrictCode = address.DistrictCode
	oldAddress.SubDistrict = address.SubDistrict
	oldAddress.SubSubDistrict = address.SubSubDistrict
	oldAddress.ZipCode = address.ZipCode
	oldAddress.Details = address.Details

	err = tx.Save(oldAddress).Error
	if err != nil {
		return nil, fmt.Errorf("error addressRepo/Update: %w", err)
	}
	tx.Commit()
	return &oldAddress, nil
}

func (a *addressRepo) FindById(ctx context.Context, address *model.Address) (*model.Address, error) {
	var addr model.Address
	err := a.db.WithContext(ctx).Where("id = ?", address.ID).First(&addr).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("error addressRepo/Findone: %w", err)
		}
		return nil, err
	}
	return &addr, nil
}

func (a *addressRepo) FindByUserId(ctx context.Context, address *model.Address) (*model.Address, error) {
	err := a.db.WithContext(ctx).Where("user_id = ?", address.UserId).First(address).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("error addressRepo/FindByUserId: %w", err)
		}
		return nil, err
	}
	return address, nil
}

func (a *addressRepo) FindAddressByUserId(ctx context.Context, userId uint64) (*model.Address, error) {
	var res *model.Address
	err := a.db.WithContext(ctx).Where("user_id = ?", userId).First(&res).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("error addressRepo/FindByUserId: %w", err)
		}
		return nil, err
	}
	return res, nil
}

func (a *addressRepo) UpdateDefault(ctx context.Context, userId uint64, addressId uint64, update shared.AddressToUpdate) error {
	var address model.Address
	var defaultAddress model.Address

	tx := a.db.Begin()
	defer tx.Rollback()

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", addressId).First(&address).Error

	if err != nil {
		return fmt.Errorf("error addressRepo/UpdateUserDefault: %w", err)
	}

	if update == shared.User {
		if address.IsDefault {
			return fmt.Errorf("error addressRepo/UpdateUserDefault: %w", ErrAlreadyDefaultAddress)
		}
	}

	if update == shared.Merchant {
		if address.IsShopLocation {
			return fmt.Errorf("error addressRepo/UpdateUserDefault: %w", ErrAlreadyDefaultAddress)
		}
	}

	if update == shared.User {
		err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("user_id = ? AND is_default = ?", userId, true).
			First(&defaultAddress).Error
	}

	if update == shared.Merchant {
		err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("user_id = ? AND is_shop_location = ?", userId, true).
			First(&defaultAddress).Error
	}

	if err != nil {
		return fmt.Errorf("error addressRepo/UpdateUserDefault: %w", ErrNoDefault)
	}

	if update == shared.User {
		address.IsDefault = true
		defaultAddress.IsDefault = false
	}

	if update == shared.Merchant {
		address.IsShopLocation = true
		defaultAddress.IsShopLocation = false
	}
	address.UpdatedAt = time.Now()
	defaultAddress.UpdatedAt = time.Now()

	err = tx.Save(address).Error
	if err != nil {
		return fmt.Errorf("error addressRepo/UpdateUserDefault: %w", err)
	}

	err = tx.Save(defaultAddress).Error
	if err != nil {
		return fmt.Errorf("error addressRepo/UpdateUserDefault: %w", err)
	}
	tx.Commit()
	return nil
}

func (a *addressRepo) FindMerchantAddressByUserID(ctx context.Context, address *model.Address) (*model.Address, error) {
	err := a.db.WithContext(ctx).Where("user_id = ?", address.UserId).Where("is_shop_location = ?", true).First(address).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("error addressRepo/Findone: %w", err)
		}
		return nil, err
	}
	return address, nil
}

func NewAddressRepo(db *gorm.DB, redis *redis.Client) AddressRepo {
	return &addressRepo{db: db, redis: redis}
}
