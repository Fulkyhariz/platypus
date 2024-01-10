package repo

import (
	"context"
	"digital-test-vm/be/internal/model"
	"fmt"
	"sort"
	"strings"

	"gorm.io/gorm"
)

type categoryRepo struct {
	db *gorm.DB
}

type CategoryRepo interface {
	GetCategory(c context.Context, category1Id, category2Id, category3Id string) (*model.CategoriesLv1, error)
	GetCategoryLv2ById(c context.Context, category2Id, category3Id string) (*model.CategoriesLv2, error)
	GetCategoryLv3ById(c context.Context, category3Id string) (*model.CategoriesLv3, error)
	ListCategoriesLv1(ctx context.Context) ([]model.ListCategoriesLv1, error)
	ListCategoriesLv2ByLv1ID(c context.Context, lv1ID string) ([]model.ListCategoriesLv2, error)
	ListCategoriesLv3ByLv2ID(c context.Context, lv2ID string) ([]model.ListCategoriesLv3, error)
	ListCategoriesByMerchantUserID(c context.Context, userID uint64) ([]model.ListMerchantCategories, error)
	FindCategoryLv1ByID(c context.Context, lv1ID string) (*model.ListCategoriesLv1, error)
	FindCategoryLv2ByID(c context.Context, lv2ID string) (*model.ListCategoriesLv2, error)
	FindCategoryLv3ByID(c context.Context, lv3ID string) (*model.ListCategoriesLv3, error)
}

var (
	queryForTotalProducts = `
		SELECT COUNT(*) AS total_products
		FROM products p
		INNER JOIN merchants m
			ON p.merchant_id = m.id
		INNER JOIN users u
			ON m.user_id = u.id
		WHERE p.is_active = TRUE
		AND m.user_id  = ?
		AND p.total_stock > ?
	`
)

func NewCategoryRepo(db *gorm.DB) CategoryRepo {
	return &categoryRepo{db: db}
}

func (r *categoryRepo) GetCategory(c context.Context, category1Id, category2Id, category3Id string) (*model.CategoriesLv1, error) {
	res := model.CategoriesLv1{}
	err := r.db.WithContext(c).Model(model.CategoriesLv1{}).Where("id = ?", category1Id).First(&res).Error
	if err != nil {
		return nil, err
	}
	if category2Id != "" {
		category2, err := r.GetCategoryLv2ById(c, category2Id, category3Id)
		if err != nil {
			return nil, err
		}
		res.Category = category2
	}
	return &res, nil
}

func (r *categoryRepo) GetCategoryLv2ById(c context.Context, category2Id, category3Id string) (*model.CategoriesLv2, error) {
	res := model.CategoriesLv2{}
	if category2Id == "" {
		return nil, nil
	}
	err := r.db.WithContext(c).Model(model.CategoriesLv2{}).Where("id=?", category2Id).First(&res).Error
	if err != nil {
		return nil, err
	}

	category3, err := r.GetCategoryLv3ById(c, category3Id)
	if err != nil {
		return nil, err
	}
	res.Category = category3

	return &res, nil
}

func (r *categoryRepo) GetCategoryLv3ById(c context.Context, category3Id string) (*model.CategoriesLv3, error) {
	res := model.CategoriesLv3{}
	if category3Id == "" {
		return nil, nil
	}
	err := r.db.WithContext(c).Model(model.CategoriesLv3{}).Where("id=?", category3Id).First(&res).Error
	if err != nil {
		return nil, err
	}
	return &res, nil
}

func (r *categoryRepo) ListCategoriesLv1(ctx context.Context) ([]model.ListCategoriesLv1, error) {
	categories := []model.ListCategoriesLv1{}
	err := r.db.WithContext(ctx).Table("categories_lv1").Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("merchantRepo/ListCategoriesLv1: %w", err)
	}
	for i, category := range categories {
		catLV2, err := r.ListCategoriesLv2ByLv1ID(ctx, category.ID)
		if err != nil {
			return nil, fmt.Errorf("categoryRepo/ListCategoriesLv1: %w", err)
		}
		categories[i].Category = catLV2
	}
	sort.Slice(categories, func(i, j int) bool {
		return categories[i].Name < categories[j].Name
	})
	return categories, nil
}

func (r *categoryRepo) ListCategoriesLv2ByLv1ID(c context.Context, lv1ID string) ([]model.ListCategoriesLv2, error) {
	categories := []model.ListCategoriesLv2{}
	err := r.db.WithContext(c).Table("categories_lv2").Where("category_lv1_id=?", lv1ID).Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/ListCategoriesLv2ByLv1ID: %w", err)
	}
	for i, category := range categories {
		catLV3, err := r.ListCategoriesLv3ByLv2ID(c, category.ID)
		if err != nil {
			return nil, fmt.Errorf("categoryRepo/ListCategoriesLv2ByLv1ID: %w", err)
		}
		categories[i].Category = catLV3
	}
	sort.Slice(categories, func(i, j int) bool {
		return categories[i].Name < categories[j].Name
	})
	return categories, nil
}

func (r *categoryRepo) ListCategoriesLv3ByLv2ID(c context.Context, lv2ID string) ([]model.ListCategoriesLv3, error) {
	categories := []model.ListCategoriesLv3{}
	err := r.db.WithContext(c).Table("categories_lv3").Where("category_lv2_id=?", lv2ID).Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/ListCategoriesLv3ByLv2ID: %w", err)
	}
	sort.Slice(categories, func(i, j int) bool {
		return categories[i].Name < categories[j].Name
	})
	return categories, nil
}

func (r *categoryRepo) FindCategoryLv1ByID(c context.Context, lv1ID string) (*model.ListCategoriesLv1, error) {
	category := model.ListCategoriesLv1{}
	err := r.db.WithContext(c).Table("categories_lv1").Where("id=?", lv1ID).First(&category).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/FindCategoryLv1ByID: %w", err)
	}
	children, err := r.ListCategoriesLv2ByLv1ID(c, category.ID)
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/FindCategoryLv1ByID: %w", err)
	}
	category.Category = children
	return &category, nil
}

func (r *categoryRepo) FindCategoryLv2ByID(c context.Context, lv2ID string) (*model.ListCategoriesLv2, error) {
	category := model.ListCategoriesLv2{}
	err := r.db.WithContext(c).Table("categories_lv2").Where("id=?", lv2ID).First(&category).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/FindCategoryLv2ByID: %w", err)
	}
	children, err := r.ListCategoriesLv3ByLv2ID(c, category.ID)
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/FindCategoryLv2ByID: %w", err)
	}
	category.Category = children
	return &category, nil
}

func (r *categoryRepo) FindCategoryLv3ByID(c context.Context, lv3ID string) (*model.ListCategoriesLv3, error) {
	category := model.ListCategoriesLv3{}
	err := r.db.WithContext(c).Table("categories_lv3").Where("id=?", lv3ID).First(&category).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/FindCategoryLv3ByID: %w", err)
	}
	return &category, nil
}

func (r *categoryRepo) ListCategoriesByMerchantUserID(c context.Context, userID uint64) ([]model.ListMerchantCategories, error) {
	categories := []model.ListMerchantCategories{}
	query := `
			SELECT
				CASE
				WHEN (p.category_lv3_id IS NULL OR p.category_lv3_id = '') AND (p.category_lv2_id IS NULL OR p.category_lv2_id = '') THEN cl."name"
				WHEN (p.category_lv3_id IS NULL OR p.category_lv3_id = '') AND (p.category_lv2_id IS NOT NULL AND p.category_lv2_id <> '') THEN cl2."name"
				ELSE cl3.name
			END AS category,
			CASE
				WHEN (p.category_lv3_id IS NULL OR p.category_lv3_id = '') AND (p.category_lv2_id IS NULL OR p.category_lv2_id = '') THEN cl.id
				WHEN (p.category_lv3_id IS NULL OR p.category_lv3_id = '') AND (p.category_lv2_id IS NOT NULL AND p.category_lv2_id <> '') THEN cl2.id
				ELSE cl3.id
			END AS category_id
			FROM products p
			INNER JOIN merchants m
				ON m.id = p.merchant_id
			INNER JOIN users u
				ON m.user_id = u.id
			INNER JOIN categories_lv1 cl
				ON p.category_lv1_id = cl.id
			LEFT JOIN categories_lv2 cl2
				ON p.category_lv2_id  = cl2.id
			LEFT JOIN categories_lv3 cl3
				ON p.category_lv3_id  = cl3.id
			WHERE p.is_active = TRUE
			AND m.user_id = ?
			AND p.total_stock > ?
			GROUP BY p.category_lv3_id , p.category_lv2_id , category, category_id;
	`
	err := r.db.WithContext(c).Table("products").Raw(query, userID, 0).Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/ListCategoriesByMerchantUserID: %w", err)
	}
	err = r.fillTotalProductsToMerchantCategories(c, userID, categories)
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/ListCategoriesByMerchantUserID: %w", err)
	}

	sort.Slice(categories, func(i, j int) bool {
		return categories[i].TotalProducts > categories[j].TotalProducts
	})
	return categories, nil
}

func (r *categoryRepo) findTotalOfProductsByUserAndCategoryLv1(c context.Context, userID uint64, categoryLv1ID string) (*uint64, error) {
	q := queryForTotalProducts + ` AND category_lv1_id = ? `

	var total uint64
	err := r.db.WithContext(c).Table("products").Raw(q, userID, 0, categoryLv1ID).Scan(&total).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/findTotalOfProductsByUserAndCategoryLv1: %w", err)
	}
	return &total, nil
}

func (r *categoryRepo) findTotalOfProductsByUserAndCategoryLv2(c context.Context, userID uint64, categoryLv2ID string) (*uint64, error) {
	q := queryForTotalProducts + ` AND category_lv2_id = ? `

	var total uint64
	err := r.db.WithContext(c).Table("products").Raw(q, userID, 0, categoryLv2ID).Scan(&total).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/findTotalOfProductsByUserAndCategoryLv2: %w", err)
	}
	return &total, nil
}

func (r *categoryRepo) findTotalOfProductsByUserAndCategoryLv3(c context.Context, userID uint64, categoryLv3ID string) (*uint64, error) {
	q := queryForTotalProducts + ` AND category_lv3_id = ? `

	var total uint64
	err := r.db.WithContext(c).Table("products").Raw(q, userID, 0, categoryLv3ID).Scan(&total).Error
	if err != nil {
		return nil, fmt.Errorf("categoryRepo/findTotalOfProductsByUserAndCategoryLv3: %w", err)
	}
	return &total, nil
}

func (r *categoryRepo) fillTotalProductsToMerchantCategories(c context.Context, userID uint64, categories []model.ListMerchantCategories) error {
	for i, category := range categories {
		if strings.Contains(category.ID, "LV-1") {
			total, err := r.findTotalOfProductsByUserAndCategoryLv1(c, userID, category.ID)
			if err != nil {
				return fmt.Errorf("categoryRepo/fillTotalProductsToMerchantCategories: %w", err)
			}
			categories[i] = model.ListMerchantCategories{Category: category.Category, ID: category.ID, TotalProducts: *total}
		}
		if strings.Contains(category.ID, "LV-2") {
			total, err := r.findTotalOfProductsByUserAndCategoryLv2(c, userID, category.ID)
			if err != nil {
				return fmt.Errorf("categoryRepo/fillTotalProductsToMerchantCategories: %w", err)
			}
			categories[i] = model.ListMerchantCategories{Category: category.Category, ID: category.ID, TotalProducts: *total}
		}
		if strings.Contains(category.ID, "LV-3") {
			total, err := r.findTotalOfProductsByUserAndCategoryLv3(c, userID, category.ID)
			if err != nil {
				return fmt.Errorf("categoryRepo/fillTotalProductsToMerchantCategories: %w", err)
			}
			categories[i] = model.ListMerchantCategories{Category: category.Category, ID: category.ID, TotalProducts: *total}
		}

	}
	return nil
}
