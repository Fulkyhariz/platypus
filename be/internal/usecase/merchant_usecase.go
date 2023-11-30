package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	"fmt"
)

type MerchantUsecase interface {
	GetMerchantByID(ctx context.Context, merchantID uint64) (*dto.Merchant, error)
	GetMerchantByUsername(ctx context.Context, username string) (*dto.Merchant, error)
}

type merchantUsecase struct {
	repo *repo.Repo
}

func NewMerchantUsecase(repo *repo.Repo) MerchantUsecase {
	return &merchantUsecase{
		repo: repo,
	}
}

func (u *merchantUsecase) GetMerchantByID(ctx context.Context, merchantID uint64) (*dto.Merchant, error) {
	merchant, err := u.repo.MerchantRepo.FindMerchantByID(ctx, merchantID)
	if err != nil {
		return nil, fmt.Errorf("merchantUsecase/GetMerchantByID: %s: %w", ErrFailedGettingMerchantData, err)
	}
	return dto.MerchantToDTO(*merchant), nil
}

func (u *merchantUsecase) GetMerchantByUsername(ctx context.Context, username string) (*dto.Merchant, error) {
	user, err := u.repo.UserRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, fmt.Errorf("merchantUsecase/GetMerchantByUsername: %s: %s: %w", ErrFailedGettingMerchantData, ErrAccountNotFound, err)
	}

	merchant, err := u.repo.MerchantRepo.FindMerchantByUserID(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("merchantUsecase/GetMerchantByUsername: %s: %w", ErrFailedGettingMerchantData, err)
	}

	address, err := u.repo.AddressRepo.FindMerchantAddressByUserID(ctx, &model.Address{UserId: user.ID})
	if err != nil {
		return nil, fmt.Errorf("merchantUsecase/GetMerchantByUsername: %s: %w", ErrFailedGettingMerchantData, err)
	}

	merchantDTO := dto.MerchantToDTO(*merchant)
	merchantDTO.Username = &user.Username
	merchantDTO.Address = dto.AddressToDTO(address)
	return merchantDTO, nil
}
