package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

type productFavoriteUsecase struct {
	repo *repo.Repo
}

type ProductFavoriteUsecase interface {
	LikeProduct(c context.Context, userId, productId uint64) error
	DislikeProduct(c context.Context, userId, productId uint64) error
	GetProductFavorite(c context.Context, id uint64) ([]dto.ListProduct, error)
	IsFavorite(c context.Context, userId, productId uint64) (dto.IsFavoriteResponse, error)
}

func NewProductFavoriteUsecase(repo *repo.Repo) ProductFavoriteUsecase {
	return &productFavoriteUsecase{
		repo: repo,
	}
}

func (u *productFavoriteUsecase) LikeProduct(c context.Context, userId, productId uint64) error {
	if _, err := u.repo.ProductRepo.IsProductExist(c, productId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("productFavoriteUseCase/LikeProduct %w", ErrProductNotFound)
		}
		return fmt.Errorf("productFavoriteUseCase/LikeProduct %w", ErrInternalServerError)
	}

	if err := u.repo.ProductFavoriteRepo.LikeProduct(c, userId, productId); err != nil {
		return err
	}

	return nil
}

func (u *productFavoriteUsecase) DislikeProduct(c context.Context, userId, productId uint64) error {
	if _, err := u.repo.ProductRepo.IsProductExist(c, productId); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("productFavoriteUseCase/DislikeProduct %w", ErrProductNotFound)
		}
		return fmt.Errorf("productFavoriteUseCase/DislikeProduct %w", ErrInternalServerError)
	}

	if err := u.repo.ProductFavoriteRepo.DislikeProduct(c, userId, productId); err != nil {
		return err
	}

	return nil
}

func (u *productFavoriteUsecase) GetProductFavorite(c context.Context, id uint64) ([]dto.ListProduct, error) {
	var res []dto.ListProduct
	productFavorite, err := u.repo.ProductRepo.GetProductFavorite(c, id)
	if err != nil {
		return nil, err
	}
	for _, v := range *productFavorite {
		res = append(res, *dto.ListProductToDTO(v))
	}
	return res, nil
}

func (u *productFavoriteUsecase) IsFavorite(c context.Context, userId, productId uint64) (dto.IsFavoriteResponse, error) {
	if _, err := u.repo.ProductRepo.IsProductExist(c, productId); err != nil {
		return dto.IsFavoriteResponse{}, fmt.Errorf("productFavoriteUseCase/DislikeProduct %w", ErrProductNotFound)
	}
	isFav := u.repo.ProductFavoriteRepo.IsFavorite(c, userId, productId)
	return dto.IsFavoriteResponse{IsFavorite: isFav}, nil
}
