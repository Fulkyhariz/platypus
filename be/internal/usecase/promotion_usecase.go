package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"errors"
	"fmt"
	"strconv"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type PromotionUsecase interface {
	CreateMerchantPromotion(ctx context.Context, userInfo *dto.UserInfo, createPromotionDTO *dto.ManagePromotion) error
	ListMerchantPromotionsByUsername(ctx context.Context, username string, listPromotionQueries dto.ListPromotionQueries) ([]dto.Promotion, *dto.PaginationInfo, error)
}

type promotionUsecase struct {
	repo *repo.Repo
}

func NewPromotionUsecase(repo *repo.Repo) PromotionUsecase {
	return &promotionUsecase{
		repo: repo,
	}
}

func (u *promotionUsecase) CreateMerchantPromotion(ctx context.Context, userInfo *dto.UserInfo, createPromotionDTO *dto.ManagePromotion) error {
	if createPromotionDTO.Promotion.PromotionType.String() == shared.Discount.String() && createPromotionDTO.Promotion.Amount.GreaterThan(decimal.NewFromInt(1)) {
		return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrInvalidAmountForDiscountTypePromo)
	}
	if createPromotionDTO.Promotion.PromotionScope.String() == shared.ProductScope.String() {
		if createPromotionDTO.Products == nil || len(createPromotionDTO.Products) == 0 {
			return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrMustSpecifyProduct)
		}
		var minPrice float64 = 0
		var minPriceProductID uint64 = 0
		for _, p := range createPromotionDTO.Products {
			product, err := u.repo.ProductRepo.GetProductByID(ctx, p)
			if err != nil {
				ErrProductNotFound = fmt.Errorf("%s: %w", ErrProductNotFound, err)
				return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrProductNotFound)
			}
			if product.MerchantId != *userInfo.MerchantId {
				ErrWrongUserTryingToAccessMerchant = fmt.Errorf("%s: %w", ErrWrongUserTryingToAccessMerchant, err)
				return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrWrongUserTryingToAccessMerchant)
			}
			variants, err := u.repo.VariantRepo.GetVariantCombinationsByProductID(ctx, nil, product.ID)
			if err != nil {
				ErrVariantNotFound = fmt.Errorf("%s: %w", ErrVariantNotFound, err)
				return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrVariantNotFound)
			}
			for _, v := range variants {
				if minPrice == 0 || minPrice < v.Price {
					minPrice = v.Price
				}
				minPriceProductID = product.ID
			}
		}

		if createPromotionDTO.Promotion.PromotionType.String() == shared.Discount.String() && createPromotionDTO.Promotion.MaxAmount.GreaterThan(decimal.NewFromFloat(minPrice)) {
			strProductID := strconv.Itoa(int(minPriceProductID))
			ErrInvalidMaxAmount = fmt.Errorf("%s: %w", ErrInvalidMaxAmount, errors.New("max amount cannot be greater than product id "+strProductID))
			return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrInvalidMaxAmount)
		}
	}

	err := u.repo.PromotionRepo.CreateMerchantPromotion(ctx, *userInfo.MerchantId, createPromotionDTO)
	if err != nil {
		ErrFailedToCreatePromotion = fmt.Errorf("%s: %w", ErrFailedToCreatePromotion, err)
		return fmt.Errorf("promotionUsecase/CreateMerchantPromotion: %w", ErrFailedToCreatePromotion)
	}
	return nil
}

func (u *promotionUsecase) ListMerchantPromotionsByUsername(ctx context.Context, username string, listPromotionQueries dto.ListPromotionQueries) ([]dto.Promotion, *dto.PaginationInfo, error) {
	user, err := u.repo.UserRepo.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, fmt.Errorf("promotionUsecase/ListMerchantPromotionsByUsername: %w", repo.ErrMerchantNotFound)
		}
		return nil, nil, fmt.Errorf("promotionUsecase/ListMerchantPromotionsByUsername: %s: %w", ErrFailedGettingMerchantData, err)
	}
	merchant, err := u.repo.MerchantRepo.FindMerchantByUserID(ctx, user.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, fmt.Errorf("promotionUsecase/ListMerchantPromotionsByUsername: %w", repo.ErrMerchantNotFound)
		}
		return nil, nil, fmt.Errorf("promotionUsecase/ListMerchantPromotionsByUsername: %s: %w", ErrFailedGettingMerchantData, err)
	}
	promotionsList, totalItems, err := u.repo.PromotionRepo.ListPromotionsByMerchantID(ctx, nil, merchant.ID, listPromotionQueries)
	if err != nil {
		return nil, nil, fmt.Errorf("promotionUsecase/ListMerchantPromotionsByUsername: %w", err)
	}

	res := []dto.Promotion{}
	for _, promotion := range promotionsList {
		res = append(res, *dto.PromotionToDTO(promotion))
	}

	pageInfo := dto.PaginationInfo{
		TotalItems:  int64(totalItems),
		TotalPages:  (int64(totalItems) + int64(listPromotionQueries.Limit) - 1) / int64(listPromotionQueries.Limit),
		CurrentPage: int64(listPromotionQueries.Page),
	}

	return res, &pageInfo, nil
}
