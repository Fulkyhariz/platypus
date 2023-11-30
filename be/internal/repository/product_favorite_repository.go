package repo

import (
	"context"
	"database/sql"
	"digital-test-vm/be/internal/model"
	"fmt"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type productFavoriteRepo struct {
	db *gorm.DB
}

type ProductFavoriteRepo interface {
	IsFavorite(c context.Context, userId, productId uint64) bool
	IsFavoriteExist(c context.Context, userId, productId uint64) (model.ProductFavorites, bool)
	LikeProduct(c context.Context, userId, productId uint64) error
	DislikeProduct(c context.Context, userId, productId uint64) error
	GetProductFavourite(c context.Context, userId uint64) ([]model.ProductFavorites, error)
}

func NewProductFavoriteRepo(db *gorm.DB) ProductFavoriteRepo {
	return &productFavoriteRepo{db: db}
}

func (r *productFavoriteRepo) IsFavorite(c context.Context, userId, productId uint64) bool {
	res := model.ProductFavorites{}
	err := r.db.WithContext(c).Model(&model.ProductFavorites{}).Where("user_id = ? and product_id=? and deleted_at is null", userId, productId).First(&res).Error
	return err == nil
}

func (r *productFavoriteRepo) IsFavoriteExist(c context.Context, userId, productId uint64) (model.ProductFavorites, bool) {
	res := model.ProductFavorites{}
	err := r.db.WithContext(c).Model(&model.ProductFavorites{}).Where("user_id = ? and product_id=?", userId, productId).First(&res).Error
	if err != nil {
		return model.ProductFavorites{}, false
	}
	return res, true
}

func (r *productFavoriteRepo) LikeProduct(c context.Context, userId, productId uint64) error {
	req := model.ProductFavorites{UserId: userId, ProductId: productId}
	productFavorite, isExists := r.IsFavoriteExist(c, userId, productId)

	tx := r.db.Begin()
	if !isExists {
		if err := tx.WithContext(c).Create(&req).Error; err != nil {
			tx.Rollback()
			return err
		}
		tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.Product{}, productId)
		if err := tx.WithContext(c).Model(&model.Product{}).Where("id=?", productId).Update("fav_count", gorm.Expr("fav_count+?", 1)).Error; err != nil {
			tx.Rollback()
			return err
		}
	} else if isExists && !productFavorite.DeletedAt.Valid {
		return nil
	} else {
		tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.ProductFavorites{}, productFavorite.ID).Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.Product{}, productId)
		if err := tx.WithContext(c).Model(&model.ProductFavorites{}).Where("id=?", productFavorite.ID).Update("deleted_at", nil).Error; err != nil {
			tx.Rollback()
			return err
		}
		if err := tx.WithContext(c).Model(&model.Product{}).Where("id=?", productId).Update("fav_count", gorm.Expr("fav_count+?", 1)).Error; err != nil {
			tx.Rollback()
			return err
		}
	}
	tx.Commit()
	return nil
}

func (r *productFavoriteRepo) DislikeProduct(c context.Context, userId, productId uint64) error {
	productFavorite, isExists := r.IsFavoriteExist(c, userId, productId)

	tx := r.db.Begin()
	if !isExists {
		tx.Rollback()
		return fmt.Errorf("productFavoriteRepo/DislikeProduct %w", ErrDislikeProduct)
	} else if isExists && productFavorite.DeletedAt.Valid {
		tx.Rollback()
		return fmt.Errorf("productFavoriteRepo/DislikeProduct %w", ErrDislikeProduct)
	}

	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.ProductFavorites{}, productFavorite.ID).Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.Product{}, productId)
	if err := tx.WithContext(c).Model(&model.ProductFavorites{}).Where("id=?", productFavorite.ID).Update("deleted_at", sql.NullTime{Time: time.Now(), Valid: true}).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.WithContext(c).Model(&model.Product{}).Where("id=?", productId).Update("fav_count", gorm.Expr("fav_count-?", 1)).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

func (r *productFavoriteRepo) GetProductFavourite(c context.Context, userId uint64) ([]model.ProductFavorites, error) {
	var res []model.ProductFavorites
	if err := r.db.WithContext(c).Model(&model.ProductFavorites{}).Where("user_id=?", userId).Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("productFavoriteRepo/GetProductFavourite %w", ErrInternalServerError)
	}
	return res, nil
}
