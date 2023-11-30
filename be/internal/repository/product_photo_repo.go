package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"fmt"

	"gorm.io/gorm"
)

type productPhotoRepo struct {
	db *gorm.DB
}

type ProductPhotoRepo interface {
	GetProductPhotoByProductId(c context.Context, productId uint64) ([]model.ProductPhoto, error)
	GetDefaultProductPhotoByProductId(c context.Context, productId uint64) (*model.ProductPhoto, error)
	GetProductReviewPhotoByProductReviewId(c context.Context, productReviewId uint64) ([]dto.ProductPhotosReviewResponse, error)
}

func NewProductPhotoRepo(db *gorm.DB) ProductPhotoRepo {
	return &productPhotoRepo{db: db}
}

func (r *productPhotoRepo) GetProductPhotoByProductId(c context.Context, productId uint64) ([]model.ProductPhoto, error) {
	var res []model.ProductPhoto
	if err := r.db.WithContext(c).Model(&model.ProductPhoto{}).Where("product_id=? and deleted_at is null", productId).Order("is_default desc").Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("productPhotoRepo/GetProductPhotoByProductId %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *productPhotoRepo) GetDefaultProductPhotoByProductId(c context.Context, productId uint64) (*model.ProductPhoto, error) {
	var res *model.ProductPhoto
	if err := r.db.WithContext(c).Model(&model.ProductPhoto{}).Where("product_id=? and deleted_at is null", productId).Order("is_default desc").First(&res).Error; err != nil {
		return nil, fmt.Errorf("productPhotoRepo/GetProductPhotoByProductId %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *productPhotoRepo) GetProductReviewPhotoByProductReviewId(c context.Context, productReviewId uint64) ([]dto.ProductPhotosReviewResponse, error) {
	var res []dto.ProductPhotosReviewResponse
	if err := r.db.WithContext(c).Model(&model.ProductReviewPhoto{}).Where("product_review_id=? and deleted_at is null", productReviewId).Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("productPhotoRepo/GetProductReviewPhotoByProductReviewId %w", ErrInternalServerError)
	}
	return res, nil
}
