package usecase

import (
	"context"
	"digital-test-vm/be/internal/auth"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	utils "digital-test-vm/be/internal/utils"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/shopspring/decimal"
)

var ErrWalletNotFound = errors.New("account not found")
var ErrWalletAlreadyCreated = errors.New("wallet already created")
var ErrWalletBlocked = errors.New("wallet is blocked")
var ErrWrongPin = errors.New("wrong pin")
var ErrGenerateTokenFailed = errors.New("token generation failed")

type walletUsecase struct {
	repo     *repo.Repo
	hashUtil utils.AppHash
}

type WalletUsecase interface {
	RegisterWallet(ctx context.Context, pin string, userId uint64) (*dto.Wallet, error)
	GetDetails(ctx context.Context, userId uint64) (*dto.WalletResponse, error)

	ValidateChangePin(ctx context.Context, username string, password string) (string, error)
	ChangePin(ctx context.Context, userId uint64, pin string) error

	AuthenticateWallet(ctx context.Context, user *dto.UserInfo, pin string) (*time.Time, string, error)

	BlockWallet(ctx context.Context, userId uint64) (*time.Time, error)
	CheckBlockedWallet(ctx context.Context, userId uint64) error

	TopUpWallet(ctx context.Context, user *dto.UserInfo, balance decimal.Decimal) error

	GetHistoryWallet(ctx context.Context, user *dto.UserInfo, page uint64) ([]dto.WalletHistoryResponse, dto.PaginationInfo, error)
}

func NewWalletUsecase(repo *repo.Repo) WalletUsecase {
	return &walletUsecase{repo: repo, hashUtil: utils.NewAppHash()}
}

func (w *walletUsecase) GetHistoryWallet(ctx context.Context, user *dto.UserInfo, page uint64) ([]dto.WalletHistoryResponse, dto.PaginationInfo, error) {
	history, itemCount, err := w.repo.WalletRepo.GetWalletTransaction(ctx, page, *user.WalletId)
	if err != nil {
		return []dto.WalletHistoryResponse{}, dto.PaginationInfo{}, fmt.Errorf("error walletUsecase/GetHistoryWallet: %w", err)
	}
	historiesResponse := dto.ToHistoryResponses(history)
	pagination := dto.PaginationInfo{
		TotalItems:  itemCount,
		CurrentPage: int64(page),
		TotalPages:  int64(math.Ceil(float64(itemCount) / float64(10))),
	}
	return historiesResponse, pagination, nil
}

func (w *walletUsecase) AuthenticateWallet(ctx context.Context, user *dto.UserInfo, pin string) (*time.Time, string, error) {
	walletModel, err := w.repo.WalletRepo.FindByUserId(ctx, user.ID)
	if err != nil {
		return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", ErrWalletNotFound)
	}
	err = w.CheckBlockedWallet(ctx, user.ID)
	if err != nil {
		return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", ErrWalletBlocked)
	}
	err = w.hashUtil.CheckPassword(walletModel.Pin, pin)

	if err != nil {
		err = nil
		zero := "0"
		times, err := w.repo.WalletRepo.GetNumOfTimesPinEntered(ctx, *user.WalletId)
		if *times == zero || err != nil {
			err = w.repo.WalletRepo.SetNumOfTimesPinEntered(ctx, "1", *user.WalletId)
			if err != nil {
				return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", err)
			}
			return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", ErrWrongPin)
		}
		two := "2"
		if *times == two {
			until, err := w.repo.WalletRepo.BlockWallet(ctx, *user.WalletId)
			if err != nil {
				return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", err)
			}
			return until, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", ErrWalletBlocked)
		}
		err = w.repo.WalletRepo.SetNumOfTimesPinEntered(ctx, "2", *user.WalletId)

		if err != nil {
			return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", err)
		}
		return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", ErrWrongPin)
	}
	token, err := auth.GenerateStepUpJWT(dto.JwtAccount{ID: user.ID})
	if err != nil {
		return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", ErrGenerateTokenFailed)
	}
	err = w.repo.WalletRepo.SetNumOfTimesPinEntered(ctx, "0", *user.WalletId)
	if err != nil {
		return nil, "", fmt.Errorf("error walletUsecase/AuthenticateWallet: %w", err)
	}
	return nil, token, nil
}

func (w *walletUsecase) TopUpWallet(ctx context.Context, user *dto.UserInfo, balance decimal.Decimal) error {
	walletModel, err := w.repo.WalletRepo.FindByUserId(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("error walletUsecase/TopUpWallet: %w", err)
	}
	desc := "Top Up Wallet"
	transaction := &model.Transaction{
		WalletId:    walletModel.WalletId,
		RecipientId: walletModel.WalletId,
		Amount:      balance,
		Description: &desc,
	}
	err = w.repo.TransactionRepo.CreateTopUp(ctx, transaction)
	if err != nil {
		return fmt.Errorf("error walletUsecase/TopUpWallet: %w", err)
	}
	return nil
}

func (w *walletUsecase) BlockWallet(ctx context.Context, userId uint64) (*time.Time, error) {
	walletModel, err := w.repo.WalletRepo.FindByUserId(ctx, userId)
	if err != nil {
		return nil, fmt.Errorf("error walletUsecase/BlockWallet: %w", err)
	}
	until, err := w.repo.WalletRepo.BlockWallet(ctx, walletModel.WalletId)
	if err != nil {
		return nil, fmt.Errorf("error walletUsecase/BlockWallet: %w", err)
	}
	return until, nil
}

func (w *walletUsecase) CheckBlockedWallet(ctx context.Context, userId uint64) error {
	walletModel, err := w.repo.WalletRepo.FindByUserId(ctx, userId)
	if err != nil {
		return fmt.Errorf("error walletUsecase/CheckBlockedWallet: %w", err)
	}
	err = w.repo.WalletRepo.CheckBlockedWallet(ctx, walletModel.WalletId)
	if err == nil {
		return fmt.Errorf("error walletUsecase/CheckBlockedWallet: %w", ErrWalletBlocked)
	}
	return nil
}

func (w *walletUsecase) ValidateChangePin(ctx context.Context, username string, password string) (string, error) {
	walletModel, err := w.repo.UserRepo.FindByUsername(ctx, username)
	if err != nil {
		return "", fmt.Errorf("error walletUsecase/ValidateChangePin: %w", err)
	}
	err = w.hashUtil.CheckPassword(walletModel.Password, password)
	if err != nil {
		return "", fmt.Errorf("error walletUsecase/ValidateChangePin: %w", ErrWrongCredential)
	}
	token, err := auth.GenerateChangePinJWT(dto.JwtAccount{
		ID: walletModel.ID,
	})
	if err != nil {
		return "", fmt.Errorf("error walletUsecase/ValidateChangePin: %w", err)
	}
	return token, nil
}

func (w *walletUsecase) ChangePin(ctx context.Context, userId uint64, pin string) error {
	walletModel, err := w.repo.WalletRepo.FindByUserId(ctx, userId)
	if err != nil {
		return fmt.Errorf("walletUsecase/ChangePin: %w", err)
	}
	err = w.hashUtil.CheckPassword(walletModel.Pin, pin)
	if err == nil {
		return fmt.Errorf("walletUsecase/ChangePin: %w", ErrPinIsSame)
	}
	newHashedPin, err := w.hashUtil.HashPassword(pin)
	if err != nil {
		return fmt.Errorf("walletUsecase/ChangePin: %w", err)
	}
	err = w.repo.WalletRepo.UpdatePin(ctx, newHashedPin, userId)
	if err != nil {
		return fmt.Errorf("walletUsecase/ChangePin: %w", err)
	}
	return nil
}

func (w *walletUsecase) RegisterWallet(ctx context.Context, pin string, userId uint64) (*dto.Wallet, error) {
	walletModel, _ := w.repo.WalletRepo.FindByUserId(ctx, userId)
	if walletModel != nil {
		return nil, fmt.Errorf("error walletUsecase/GetDetails: %w", ErrWalletAlreadyCreated)
	}
	walletModel = &model.Wallet{
		WalletId: fmt.Sprint(shared.WalletNumber + userId),
		UserId:   userId,
	}
	hashedPin, err := w.hashUtil.HashPassword(pin)
	if err != nil {
		return nil, fmt.Errorf("error walletUsecase/RegisterWallet: %w", err)
	}
	walletModel.Pin = hashedPin
	walletModel, err = w.repo.WalletRepo.Create(ctx, walletModel)
	if err != nil {
		return nil, fmt.Errorf("error walletUsecase/RegisterWallet: %w", err)
	}
	walletDto := dto.ToWalletDTO(walletModel)
	return walletDto, nil
}

func (w *walletUsecase) GetDetails(ctx context.Context, userId uint64) (*dto.WalletResponse, error) {
	err := w.CheckBlockedWallet(ctx, userId)
	if err != nil {
		return nil, fmt.Errorf("error walletUsecase/GetDetails: %w", ErrWalletBlocked)
	}
	walletModel, err := w.repo.WalletRepo.FindByUserId(ctx, userId)
	if err != nil {
		return nil, fmt.Errorf("error walletUsecase/GetDetails: %w", ErrWalletNotFound)
	}
	WalletResponse := &dto.WalletResponse{
		ID:       walletModel.ID,
		WalletId: walletModel.WalletId,
		UserId:   walletModel.UserId,
		Balance:  walletModel.Balance,
	}
	return WalletResponse, nil
}
