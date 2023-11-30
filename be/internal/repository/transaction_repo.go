package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"fmt"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type transactionRepo struct {
	db         *gorm.DB
	walletRepo WalletRepo
	redis      *redis.Client
}

type TransactionRepo interface {
	CreateTopUp(ctx context.Context, transaction *model.Transaction) (error)
	CreatePayment(ctx context.Context, tx *gorm.DB,transaction *model.Transaction, payment *model.Payment) (error)
	CreateTransaction(ctx context.Context, tx *gorm.DB,transaction *model.Transaction) (error)
}

func NewTransactionRepo(db *gorm.DB, wallet WalletRepo, redis *redis.Client) TransactionRepo {
	return &transactionRepo{db: db, walletRepo: wallet, redis: redis}
}

func (tr *transactionRepo) CreateTopUp(ctx context.Context, transaction *model.Transaction) (error) {
	tx := tr.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Create(transaction).Error
	if err != nil {
		return fmt.Errorf("error transactionRepo/CreateTopUp: %w", err)
	}
	tx, err = tr.walletRepo.UpdateBalance(ctx, tx, transaction.WalletId, transaction.Amount)
	if err != nil {
		return fmt.Errorf("error transactionRepo/CreateTopUp: %w", err)
	}
	tx.Commit()
	return nil
}

func (tr *transactionRepo) CreateTransaction(ctx context.Context, tx *gorm.DB,transaction *model.Transaction) (error){
	if tx == nil {
		tx = tr.db.WithContext(ctx).Begin()
		defer tx.Commit()
	}
	err := tx.Create(transaction).Error
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error transactionRepo/CreatePayment: %w", err)
	}
	tx, err = tr.walletRepo.UpdateBalance(ctx, tx, transaction.WalletId, transaction.Amount)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error transactionRepo/CreatePayment: %w", err)
	}
	return nil
}

func (tr *transactionRepo) CreatePayment(ctx context.Context, tx *gorm.DB,transaction *model.Transaction, payment *model.Payment) (error) {
	if tx == nil {
		tx = tr.db.WithContext(ctx).Begin()
		defer tx.Commit()
	}

	err := tx.Create(transaction).Error
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error transactionRepo/CreatePayment: %w", err)
	}
	payment.WalletHistoryId = transaction.ID
	err = tx.Create(payment).Error
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error transactionRepo/CreatePayment: %w", err)
	}
	tx, err = tr.walletRepo.UpdateBalance(ctx, tx, transaction.WalletId, transaction.Amount)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error transactionRepo/CreatePayment: %w", err)
	}
	return nil
}
