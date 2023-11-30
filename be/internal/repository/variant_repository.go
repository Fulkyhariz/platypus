package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

type variantRepo struct {
	db *gorm.DB
}

type VariantRepo interface {
	GetVariantCombinationsByProductID(c context.Context, tx *gorm.DB, productID uint64) ([]model.VariantCombinationDetailResult, error)
	GetVariantProduct(c context.Context, productId uint64, merchantId uint64) ([]*model.VariantDetailResult, error)
	IsVariantCombinationProductIsExists(c context.Context, id uint64) (*model.VariantCombinationProduct, bool)
}

func NewVariantRepo(db *gorm.DB) VariantRepo {
	return &variantRepo{db: db}
}

func (r *variantRepo) GetVariantProduct(c context.Context, productId, merchantId uint64) ([]*model.VariantDetailResult, error) {
	res := []*model.VariantDetailResult{}
	err := r.db.WithContext(c).Raw(`select vcp.id as variant_combination_product_id,vc.id as variant_combination_id, vt.type_name as type_name_parent, vtc.type_name as type_name_child, vg.group_name as group_name_parent, vgc.group_name as group_name_child, vcp.stock, vcp.price, vtc.variant_image as variant_image from products as p
	inner join variant_combination_products as vcp on p.id=vcp.product_id
	inner join variant_combinations as vc on vcp.variant_combination_id =vc.id
	left join variant_types as vt on vt.id = vc.variant_type_parent_id
	left join variant_types as vtc on vtc.id =vc.variant_type_child_id
	left join variant_groups as vg on vt.variant_group_id =vg.id
	left join variant_groups as vgc on vtc.variant_group_id =vgc.id
	where p.merchant_id =? and vcp.product_id=?
	order by variant_combination_product_id;`, merchantId, productId).Scan(&res).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, shared.ErrVariantNotFound
	}

	if err != nil {
		return nil, shared.ErrInternalServerError
	}
	return res, nil
}

func (r *variantRepo) IsVariantCombinationProductIsExists(c context.Context, id uint64) (*model.VariantCombinationProduct, bool) {
	var res *model.VariantCombinationProduct
	if err := r.db.WithContext(c).Model(&model.VariantCombinationProduct{}).Where("id=?", id).First(&res).Error; err != nil {
		return nil, false
	}
	return res, true
}

func (r *variantRepo) GetVariantCombinationsByProductID(c context.Context, tx *gorm.DB, productID uint64) ([]model.VariantCombinationDetailResult, error) {
	res := []model.VariantCombinationDetailResult{}

	var db *gorm.DB
	if tx == nil {
		db = r.db
	} else {
		db = tx
	}

	q := `SELECT vcp.id, vc.id AS combination_id,
	pvg.id AS parent_group_id, pvg.group_name AS parent_group_name,
	pvt.id AS parent_type_id, pvt.type_name AS parent_type_name, COALESCE(pvt.variant_image, '') AS parent_type_image,
	COALESCE(cvg.id, 0) AS child_group_id, COALESCE(cvg.group_name, '') AS child_group_name,
	COALESCE(cvt.id, 0) AS child_type_id, COALESCE(cvt.type_name, '') AS child_type_name, COALESCE(cvt.variant_image, '') AS child_type_image,
	vcp.stock, vcp.price
	FROM variant_combination_products vcp
	INNER JOIN variant_combinations vc
		ON vcp.variant_combination_id = vc.id
		AND vcp.product_id = ?
	LEFT JOIN variant_types pvt
		ON vc.variant_type_parent_id = pvt.id
	LEFT JOIN variant_types cvt
		ON vc.variant_type_child_id = cvt.id
	LEFT JOIN variant_groups pvg
		ON pvt.variant_group_id = pvg.id
	LEFT JOIN variant_groups cvg
		ON cvt.variant_group_id = cvg.id;`
	err := db.WithContext(c).Raw(q, productID).Find(&res).Error
	if err != nil {
		return nil, fmt.Errorf("variantRepo/GetVariantCombinationsByProductID: %w", err)
	}
	return res, nil
}
