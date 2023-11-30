package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type PromotionRepo interface {
	CreatePromotion(ctx context.Context, tx *gorm.DB, promotion *model.Promotion) (*model.Promotion, error)
	UpdatePromotion(ctx context.Context, tx *gorm.DB, promotion *model.Promotion) (*model.Promotion, error)
	CreateProductPromotion(ctx context.Context, tx *gorm.DB, merchantProductPromo *model.MerchantProductPromotion) error
	CreateMerchantPromotion(ctx context.Context, merchantID uint64, createPromotionDTO *dto.ManagePromotion) error
	ListPromotionsByMerchantID(ctx context.Context, tx *gorm.DB, merchantID uint64, args dto.ListPromotionQueries) ([]model.Promotion, uint64, error)
}

type promotionRepo struct {
	db          *gorm.DB
	productRepo ProductRepo
}

func NewPromotionRepo(db *gorm.DB, productRepo ProductRepo) PromotionRepo {
	return &promotionRepo{
		db:          db,
		productRepo: productRepo,
	}
}

func (r *promotionRepo) CreatePromotion(ctx context.Context, tx *gorm.DB, promotion *model.Promotion) (*model.Promotion, error) {
	var db *gorm.DB
	if tx != nil {
		db = tx
	} else {
		db = r.db
	}

	err := db.WithContext(ctx).Create(&promotion).Error
	if err != nil {
		return nil, fmt.Errorf("promotionRepo/CreatePromotion: %w", err)
	}
	return promotion, nil
}

func (r *promotionRepo) CreateProductPromotion(ctx context.Context, tx *gorm.DB, merchantProductPromo *model.MerchantProductPromotion) error {
	var db *gorm.DB
	if tx != nil {
		db = tx
	} else {
		db = r.db
	}

	err := db.WithContext(ctx).Create(&merchantProductPromo).Error
	if err != nil {
		return fmt.Errorf("promotionRepo/CreateProductPromotion: %w", err)
	}
	return nil
}

func (r *promotionRepo) CreateMerchantPromotion(ctx context.Context, merchantID uint64, createPromotionDTO *dto.ManagePromotion) error {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		promotion, err := r.CreatePromotion(ctx, tx, createPromotionDTO.Promotion.ToModel())
		if err != nil {
			return err
		}

		if createPromotionDTO.Products != nil || len(createPromotionDTO.Products) > 0 {
			for _, p := range createPromotionDTO.Products {
				merchantProductPromo := &model.MerchantProductPromotion{
					MerchantID:  merchantID,
					PromotionID: promotion.ID,
					ProductID:   p,
				}
				err := r.CreateProductPromotion(ctx, tx, merchantProductPromo)
				if err != nil {
					return fmt.Errorf("promotionRepo/CreateProductPromotion: %w", err)
				}
			}
		} else {
			merchantProductPromo := &model.MerchantProductPromotion{
				MerchantID:  merchantID,
				PromotionID: promotion.ID,
			}
			err := r.CreateProductPromotion(ctx, tx, merchantProductPromo)
			if err != nil {
				return fmt.Errorf("promotionRepo/CreateProductPromotion: %w", err)
			}
		}

		return nil
	})
	if err != nil {
		return fmt.Errorf("promotionRepo/CreateMerchantPromotion: %w", err)
	}
	return nil
}

func (r *promotionRepo) UpdatePromotion(ctx context.Context, tx *gorm.DB, promotion *model.Promotion) (*model.Promotion, error) {
	var db *gorm.DB
	if tx != nil {
		db = tx
	} else {
		db = r.db
	}

	err := db.WithContext(ctx).Updates(&promotion).Error
	if err != nil {
		return nil, fmt.Errorf("promotionRepo/UpdatePromotion: %w", err)
	}
	return promotion, nil
}

func (r *promotionRepo) GetPromotionByID(ctx context.Context, tx *gorm.DB, promoID uint64) (*model.Promotion, error) {
	var db *gorm.DB
	if tx != nil {
		db = tx
	} else {
		db = r.db
	}

	var promotion model.Promotion
	if err := db.WithContext(ctx).First(&promotion).Error; err != nil {
		return nil, fmt.Errorf("promotionRepo/GetPromotionByID: %w", err)
	}
	return &promotion, nil
}

func (r *promotionRepo) ListPromotionsByMerchantID(ctx context.Context, tx *gorm.DB, merchantID uint64, args dto.ListPromotionQueries) ([]model.Promotion, uint64, error) {
	var db *gorm.DB
	if tx != nil {
		db = tx
	} else {
		db = r.db
	}

	q := `
		SELECT p.id, p.banner,p.promo_name, p.promotion_type, p.promotion_scope,
		p.voucher_code, p.amount, p.quota, COALESCE(p.max_amount, 0) AS max_amount, p.start_date, p.end_date
		FROM promotions p
		INNER JOIN merchant_product_promotions mpp
			ON p.id = mpp.promotion_id
			AND mpp.merchant_id = ?
	`

	promotions := []model.Promotion{}

	now := time.Now().Format("2006-01-02 15:04:05")
	switch args.Status.String() {
	case shared.PromotionStatusOngoing.String():
		q += " WHERE p.start_date <= '" + now + "' AND p.end_date >= '" + now + "'"
	case shared.PromotionStatusWillCome.String():
		q += " WHERE p.start_date > '" + now + "'"
	case shared.PromotionStatusEnded.String():
		q += " WHERE p.end_date < '" + now + "'"
	}

	q += "GROUP BY p.id ORDER BY p.id DESC"
	qForCount := q

	offset := (args.Page - 1) * args.Limit
	q += " LIMIT ? OFFSET ? "

	var totalItems int64
	promotionsForCount := []model.Promotion{}
	if err := r.db.WithContext(ctx).Raw(qForCount, merchantID).Scan(&promotionsForCount).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProducts: %w", err)
	}
	totalItems = int64(len(promotionsForCount))

	if err := db.WithContext(ctx).Raw(q, merchantID, args.Limit, offset).Scan(&promotions).Error; err != nil {
		return nil, 0, fmt.Errorf("promotionRepo/ListPromotionsByMerchantID: %w", err)
	}

	var merchantProductPromotions []model.MerchantProductPromotion
	if err := db.WithContext(ctx).Where("merchant_id = ?", merchantID).Find(&merchantProductPromotions).Error; err != nil {
		return nil, 0, fmt.Errorf("promotionRepo/ListPromotionsByMerchantID: %w", err)
	}

	newPromotions := []model.Promotion{}
	for _, promo := range promotions {
		if promo.PromotionScope == shared.ProductScope.String() {
			promo.Products = []model.ListProduct{}
			for _, merchantProductPromo := range merchantProductPromotions {
				if promo.ID == merchantProductPromo.PromotionID {
					product, err := r.productRepo.SingleListProductByID(ctx, db, merchantProductPromo.ProductID)
					if err != nil {
						return nil, 0, fmt.Errorf("promotionRepo/ListPromotionsByMerchantID: %w", err)
					}
					promo.Products = append(promo.Products, *product)
				}
			}
		}
		newPromotions = append(newPromotions, promo)
	}
	return newPromotions, uint64(totalItems), nil
}
