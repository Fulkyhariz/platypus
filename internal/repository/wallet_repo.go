package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type walletRepo struct {
	db    *gorm.DB
	redis *redis.Client
}

type WalletRepo interface {
	Create(ctx context.Context, wallet *model.Wallet) (*model.Wallet, error)
	UpdatePin(ctx context.Context, pin string, userId uint64) error

	FindByWalletId(ctx context.Context, walletId string) (*model.Wallet, error)
	FindByUserId(ctx context.Context, userId uint64) (*model.Wallet, error)

	GetNumOfTimesPinEntered(ctx context.Context, walletId string) (*string, error)
	SetNumOfTimesPinEntered(ctx context.Context, numOfTimes string, walletId string) error

	BlockWallet(ctx context.Context, walletId string) (*time.Time, error)
	CheckBlockedWallet(ctx context.Context, walletId string) error

	GetWalletTransaction(ctx context.Context, page uint64, walletId string) ([]model.WalletHistory, int64, error)

	UpdateBalance(ctx context.Context, tx *gorm.DB, walletId string, balance decimal.Decimal) (*gorm.DB, error)
}

func NewWalletRepo(db *gorm.DB, redis *redis.Client) WalletRepo {
	return &walletRepo{db: db, redis: redis}
}

func (wr *walletRepo) GetWalletTransaction(ctx context.Context, page uint64, walletId string) ([]model.WalletHistory, int64, error) {
	var walletHistory []model.WalletHistory
	var count int64

	offset := int(page-1) * 10
	err := wr.db.Table("transactions").Where("wallet_id = ?", walletId).Order("created_at DESC").Offset(offset).Limit(10).
		Scan(&walletHistory).Error
	if err != nil {
		return nil, 0, fmt.Errorf("walletRepo/GetWalletTransaction: %w", err)
	}
	err = wr.db.Table("transactions").Where("wallet_id = ?", walletId).
		Count(&count).Error
	if err != nil {
		return nil, 0, fmt.Errorf("walletRepo/GetWalletTransaction: %w", err)
	}
	return walletHistory, count, nil
}

func (wr *walletRepo) GetNumOfTimesPinEntered(ctx context.Context, walletId string) (*string, error) {
	key := fmt.Sprint(walletId) + ":PIN"
	times, err := wr.redis.Get(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("walletRepo/GetNumOfTimesPinEntered: %w", err)
	}
	return &times, nil
}
func (wr *walletRepo) SetNumOfTimesPinEntered(ctx context.Context, numOfTimes string, walletId string) error {

	until := time.Until(time.Now().Add(3 * time.Minute))

	key := fmt.Sprint(walletId) + ":PIN"
	err := wr.redis.Set(ctx, key, numOfTimes, until).Err()

	if err != nil {
		return fmt.Errorf("walletRepo/SetNumOfTimesPinEntered: %w", err)
	}
	return nil
}

func (wr *walletRepo) UpdateBalance(ctx context.Context, tx *gorm.DB, walletId string, balance decimal.Decimal) (*gorm.DB, error) {
	var wallet model.Wallet
	if tx == nil {
		tx = wr.db.WithContext(ctx).Begin()
		defer tx.Commit()
	}
	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("wallet_id = ?", walletId).First(&wallet).Error
	if err != nil {
		return tx, fmt.Errorf("error walletRepo/UpdateBalance: %w", err)
	}
	wallet.Balance = wallet.Balance.Add(balance)
	wallet.UpdatedAt = time.Now()
	err = tx.Save(wallet).Error
	if err != nil {
		tx.Rollback()
		return tx, fmt.Errorf("error walletRepo/UpdateBalance: %w", err)
	}
	return tx, nil
}

func (wr *walletRepo) BlockWallet(ctx context.Context, walletId string) (*time.Time, error) {
	until := time.Now().Add(15 * time.Minute)
	key := fmt.Sprint(walletId) + ":BLOCKED"
	err := wr.redis.Set(ctx, key, true, time.Until(until)).Err()

	if err != nil {
		return nil, fmt.Errorf("walletRepo/BlockWallet: %w", err)
	}
	return &until, nil
}

func (wr *walletRepo) CheckBlockedWallet(ctx context.Context, walletId string) error {
	key := fmt.Sprint(walletId) + ":BLOCKED"
	_, err := wr.redis.Get(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("walletRepo/CheckBlockedWallet: %w", err)
	}
	return nil
}

func (wr *walletRepo) UpdatePin(ctx context.Context, pin string, userId uint64) error {
	var wallet model.Wallet

	tx := wr.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userId).First(&wallet).Error
	if err != nil {
		return fmt.Errorf("error walletRepo/UpdatePin: %w", err)
	}
	wallet.Pin = pin
	wallet.UpdatedAt = time.Now()
	err = tx.Save(wallet).Error
	if err != nil {
		return fmt.Errorf("error walletRepo/UpdatePin: %w", err)
	}
	tx.Commit()
	return nil
}

func (wr *walletRepo) Create(ctx context.Context, wallet *model.Wallet) (*model.Wallet, error) {
	err := wr.db.Create(wallet).Error
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("error walletRepo/Create: %w", ErrWalletAlreadyCreated)
		}
		return nil, err
	}
	return wallet, nil
}

func (wr *walletRepo) FindByWalletId(ctx context.Context, walletId string) (*model.Wallet, error) {
	var wallet model.Wallet
	err := wr.db.WithContext(ctx).Where("walletId = ?", walletId).First(&wallet).Error
	if err != nil {
		return nil, fmt.Errorf("error walletRepo/FindByWalletId: %w", ErrWalletNotFound)
	}
	return &wallet, nil
}

func (wr *walletRepo) FindByUserId(ctx context.Context, userId uint64) (*model.Wallet, error) {
	var wallet model.Wallet
	err := wr.db.WithContext(ctx).Where("user_id = ?", userId).First(&wallet).Error
	if err != nil {
		return nil, fmt.Errorf("error walletRepo/FindByUserId: %w", ErrWalletNotFound)
	}
	return &wallet, nil
}
