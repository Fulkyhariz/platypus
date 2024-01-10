package usecase

import (
	"context"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	"fmt"
)

type CategoryUsecase interface {
	ListCategories(ctx context.Context) ([]model.ListCategoriesLv1, error)
	ListCategoriesByMerchantUsername(ctx context.Context, username string) ([]model.ListMerchantCategories, error)
	GetCategoryLv1ByID(ctx context.Context, id string) (*model.ListCategoriesLv1, error)
	GetCategoryLv2ByID(ctx context.Context, id string) (*model.ListCategoriesLv2, error)
	GetCategoryLv3ByID(ctx context.Context, id string) (*model.ListCategoriesLv3, error)
}

type categoryUsecase struct {
	repo *repo.Repo
}

func NewCategoryUsecase(repo *repo.Repo) CategoryUsecase {
	return &categoryUsecase{
		repo: repo,
	}
}

func (u *categoryUsecase) ListCategories(ctx context.Context) ([]model.ListCategoriesLv1, error) {
	categories, err := u.repo.CategoryRepo.ListCategoriesLv1(ctx)
	if err != nil {
		return nil, fmt.Errorf("categoryUsecase/ListCategories: %s: %w", ErrFailedGettingListofCategories, err)
	}
	return categories, nil
}

func (u *categoryUsecase) ListCategoriesByMerchantUsername(ctx context.Context, username string) ([]model.ListMerchantCategories, error) {
	user, err := u.repo.UserRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, fmt.Errorf("categoryUsecase/ListCategoriesByMerchantUserID: %s: %w", ErrFailedGettingListofCategories, err)
	}

	categories, err := u.repo.CategoryRepo.ListCategoriesByMerchantUserID(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("categoryUsecase/ListCategoriesByMerchantUserID: %s: %w", ErrFailedGettingListofCategories, err)
	}

	return categories, nil
}

func (u *categoryUsecase) GetCategoryLv1ByID(ctx context.Context, id string) (*model.ListCategoriesLv1, error) {
	category, err := u.repo.CategoryRepo.FindCategoryLv1ByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("categoryUsecase/GetCategoryLv1ByID: %s: %w", ErrFailedGettingCategory, err)
	}
	return category, nil
}

func (u *categoryUsecase) GetCategoryLv2ByID(ctx context.Context, id string) (*model.ListCategoriesLv2, error) {
	category, err := u.repo.CategoryRepo.FindCategoryLv2ByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("categoryUsecase/GetCategoryLv2ByID: %s: %w", ErrFailedGettingCategory, err)
	}
	return category, nil
}

func (u *categoryUsecase) GetCategoryLv3ByID(ctx context.Context, id string) (*model.ListCategoriesLv3, error) {
	category, err := u.repo.CategoryRepo.FindCategoryLv3ByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("categoryUsecase/GetCategoryLv3ByID: %s: %w", ErrFailedGettingCategory, err)
	}
	return category, nil
}
