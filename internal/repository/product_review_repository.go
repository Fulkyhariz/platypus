package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type productReviewRepo struct {
	db *gorm.DB
}

type ProductReviewRepo interface {
	GetProductReview(c context.Context, req dto.GetProductReviewRequest) ([]model.ProductReview, error)
	GetAllProductReview(c context.Context, req dto.GetProductReviewRequest) ([]model.ProductReview, error)
	CreateProductReview(c context.Context, req model.ProductReview, product model.Product) error
	IsProductReviewed(c context.Context, userId, productId, orderDetailId uint64) bool
}

func NewProductReviewRepo(db *gorm.DB) ProductReviewRepo {
	return &productReviewRepo{db: db}
}

func (r *productReviewRepo) GetProductReview(c context.Context, req dto.GetProductReviewRequest) ([]model.ProductReview, error) {
	res := []model.ProductReview{}
	q := r.db.WithContext(c).Model(&model.ProductReview{}).Where("product_id = ?", req.ProductId)
	if req.Rating > 0 && req.Rating < 6 {
		q = q.Where("rating=?", req.Rating)
	}
	if req.Comments == "true" {
		q = q.Where("description is not null")
	}
	if req.Comments == "false" {
		q = q.Where("description is null")
	}
	if req.Images == "true" {
		q = q.Where("photos is not null")
	}
	if req.Images == "false" {
		q = q.Where("photos is null")
	}
	q = q.Where("deleted_at is null")
	offset := (req.Page - 1) * req.Limit
	if err := q.Order("created_at " + req.Order).Offset(offset).Limit(req.Limit).Find(&res).Error; err != nil {
		return []model.ProductReview{}, fmt.Errorf("productReviewRepo/GetProductReview %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *productReviewRepo) GetAllProductReview(c context.Context, req dto.GetProductReviewRequest) ([]model.ProductReview, error) {
	res := []model.ProductReview{}
	q := r.db.WithContext(c).Model(&model.ProductReview{}).Where("product_id = ?", req.ProductId)
	if req.Rating > 0 && req.Rating < 6 {
		q = q.Where("rating=?", req.Rating)
	}
	if req.Comments == "true" {
		q = q.Where("description is not null")
	}
	if req.Comments == "false" {
		q = q.Where("description is null")
	}
	if req.Images == "true" {
		q = q.Where("photos is not null")
	}
	if req.Images == "false" {
		q = q.Where("photos is null")
	}
	if err := q.Where("deleted_at is null").Find(&res).Error; err != nil {
		return res, fmt.Errorf("productReviewRepo/GetAllProductReview %w", shared.ErrInternalServerError)
	}
	return res, nil
}

func (r *productReviewRepo) CreateProductReview(c context.Context, req model.ProductReview, product model.Product) error {
	tx := r.db.Begin()
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.Product{}, req.ProductId)
	newRating := ((product.AverageRating * float64(product.TotalRating)) + float64(req.Rating)) / float64(product.TotalRating+1)
	if err := tx.WithContext(c).Model(&model.Product{}).Where("id=?", req.ProductId).Update("average_rating", newRating).Update("total_rating", gorm.Expr("total_rating+1")).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("productReviewRepo/CreateProductReview %w", ErrInternalServerError)
	}
	if err := r.db.WithContext(c).Create(&req).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("productReviewRepo/CreateProductReview %w", ErrInternalServerError)
	}
	tx.Commit()

	return nil
}

func (r *productReviewRepo) IsProductReviewed(c context.Context, userId, productId, orderDetailId uint64) bool {
	var res model.ProductReview
	if err := r.db.Debug().WithContext(c).Model(&model.ProductReview{}).Where("product_id=? and user_id=? and order_detail_id=?", productId, userId, orderDetailId).First(&res).Error; err != nil {
		return false
	}
	return true
}
