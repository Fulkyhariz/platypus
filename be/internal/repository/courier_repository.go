package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"fmt"

	"gorm.io/gorm"
)

type CourierRepo interface {
	FindCouriersByProductID(ctx context.Context, productID uint64) ([]model.Courier, error)
}

type courierRepo struct {
	db *gorm.DB
}

func NewCourierRepo(db *gorm.DB) CourierRepo {
	return &courierRepo{
		db: db,
	}
}

func (r *courierRepo) FindCouriersByProductID(ctx context.Context, productID uint64) ([]model.Courier, error) {
	couriers := []model.Courier{}
	q := `SELECT c.id, c.name, c.description
		FROM product_couriers pc
		JOIN couriers c
			ON c.id = pc.courier_id
			AND pc.product_id = ?`
	err := r.db.WithContext(ctx).Table("product_couriers").Raw(q, productID).Find(&couriers).Error
	if err != nil {
		return nil, fmt.Errorf("courierRepo/FindCouriersByProductID: %w", err)
	}
	return couriers, nil
}
