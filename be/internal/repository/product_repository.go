package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrProductNotFound  = errors.New(shared.ErrProductNotFound.Message)
	ErrCategoryNotFound = errors.New(shared.ErrCategoryNotFound.Message)
)

type productRepo struct {
	db                  *gorm.DB
	merchantRepo        MerchantRepo
	categoryRepo        CategoryRepo
	productFavoriteRepo ProductFavoriteRepo
	variantRepo         VariantRepo
}

type ProductRepo interface {
	ListProductsByMerchantID(ctx context.Context, merchantID uint64, args dto.ListProductByMerchantQueries) ([]model.ListProduct, uint64, error)
	ListProducts(ctx context.Context, args dto.ListProductQueries) ([]model.ListProduct, uint64, error)
	GetDetailProduct(c context.Context, productId uint64) (model.Product, error)
	IsProductExist(c context.Context, id uint64) (model.Product, error)
	ListProductsByUserID(ctx context.Context, userID uint64, args dto.ListProductByMerchantQueries) ([]model.ListProduct, uint64, error)
	DeactivateProduct(c context.Context, productId uint64) error
	ActivateProduct(c context.Context, productId uint64) error
	GetProductFavorite(c context.Context, productId uint64) (*[]model.ListProduct, error)
	CreateProduct(ctx context.Context, merchantID uint64, createProductDTO *dto.ManageProduct) error
	GetProductByID(ctx context.Context, productID uint64) (*model.Product, error)
	GetProductByVariantCombinationProductId(ctx context.Context, variantCombinationProductId uint64) (*model.Product, error)
	UpdateProduct(ctx context.Context, merchantID uint64, updateProductDTO *dto.ManageProduct) error
	SingleListProductByID(ctx context.Context, tx *gorm.DB, productID uint64) (*model.ListProduct, error)
}

func NewProductRepo(db *gorm.DB, merchantRepo MerchantRepo, categoryRepo CategoryRepo, productFavoriteRepo ProductFavoriteRepo, variantRepo VariantRepo) ProductRepo {
	return &productRepo{db: db, merchantRepo: merchantRepo, categoryRepo: categoryRepo, productFavoriteRepo: productFavoriteRepo, variantRepo: variantRepo}
}

var listProductBaseQuery = `SELECT
	p.id, u.username, p.merchant_id, pp.url AS photo, p.title, p.total_sold,
	p.fav_count, p.average_rating, p.total_stock, a.district AS city,
	p.category_lv1_id, p.category_lv2_id, p.category_Lv3_id, mp.min_price, p.is_active, p.created_at, p.updated_at
	FROM products p
	INNER JOIN
		(SELECT product_id, MIN(price) AS min_price FROM variant_combination_products GROUP BY product_id) AS mp
		ON mp.product_id = p.id
	INNER JOIN merchants m
		ON m.id = p.merchant_id
	INNER JOIN users u
		ON m.user_id = u.id
	INNER JOIN addresses a
		ON u.id = a.user_id
		AND is_shop_location IS TRUE
	LEFT JOIN product_photos pp
		ON p.id = pp.product_id
		AND pp.is_default IS TRUE`

func (r *productRepo) ListProductsByMerchantID(ctx context.Context, merchantID uint64, args dto.ListProductByMerchantQueries) ([]model.ListProduct, uint64, error) {
	products := []model.ListProduct{}

	baseQ := listProductBaseQuery + " WHERE merchant_id = ?"

	if args.Keyword != "" {
		baseQ += " AND title ILIKE " + "'%" + args.Keyword + "%'"
	}

	if args.Category != "" {
		baseQ += " AND category_lv1_id = " + "'" + args.Category + "'"
	}

	if args.ExcludeNoStock {
		baseQ += " AND p.total_stock > 0 "
	}

	if args.ExcludeNotActive {
		baseQ += " AND p.is_active = TRUE"
	}

	additionalSort := ""
	if args.SortBy != "created_at" {
		additionalSort = ", created_at DESC"
	}
	qForCount := baseQ
	baseQ += " ORDER BY " + args.SortBy + " " + args.SortOrder + additionalSort

	offset := (args.Page - 1) * args.Limit
	baseQ += " LIMIT ? OFFSET ? "

	query := r.db.WithContext(ctx).Table("products").Raw(
		baseQ, merchantID, args.Limit, offset)

	var totalItems int64
	if err := r.db.WithContext(ctx).Table("products").Raw(qForCount, true, 0, merchantID).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProductsByMerchantID: %w", err)
	}
	totalItems = int64(len(products))

	if err := query.Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProductsByMerchantID: %w", err)
	}

	return products, uint64(totalItems), nil
}



func (r *productRepo) ListProductsByUserID(ctx context.Context, userID uint64, args dto.ListProductByMerchantQueries) ([]model.ListProduct, uint64, error) {
	products := []model.ListProduct{}

	baseQ := listProductBaseQuery + " WHERE m.user_id = ?"

	if args.Keyword != "" {
		baseQ += " AND title ILIKE " + "'%" + args.Keyword + "%'"
	}

	if strings.Contains(args.Category, "LV-1") {
		baseQ += " AND category_lv1_id = " + "'" + args.Category + "'"
	}
	if strings.Contains(args.Category, "LV-2") {
		baseQ += " AND category_lv2_id = " + "'" + args.Category + "'"
	}
	if strings.Contains(args.Category, "LV-3") {
		baseQ += " AND category_lv3_id = " + "'" + args.Category + "'"
	}

	if args.ExcludeNoStock {
		baseQ += " AND p.total_stock > 0 "
	}

	if args.ExcludeNotActive {
		baseQ += " AND p.is_active IS TRUE"
	}

	additionalSort := ""
	if args.SortBy != "created_at" {
		additionalSort = ", created_at DESC"
	}
	qForCount := baseQ
	baseQ += " ORDER BY " + args.SortBy + " " + args.SortOrder + additionalSort

	offset := (args.Page - 1) * args.Limit
	baseQ += " LIMIT ? OFFSET ? "

	query := r.db.WithContext(ctx).Table("products").Raw(
		baseQ, userID, args.Limit, offset)

	var totalItems int64
	if err := r.db.WithContext(ctx).Table("products").Raw(qForCount, userID).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProductsByUserID: %w", err)
	}
	totalItems = int64(len(products))

	if err := query.Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProductsByUserID: %w", err)
	}

	return products, uint64(totalItems), nil
}

func (r *productRepo) ListProducts(ctx context.Context, args dto.ListProductQueries) ([]model.ListProduct, uint64, error) {
	products := []model.ListProduct{}

	baseQ := listProductBaseQuery + " WHERE p.is_active = TRUE AND p.total_stock > 0 AND average_rating >= ? "

	if !args.MinPrice.Equal(decimal.Zero) {
		baseQ += " AND min_price >= " + args.MinPrice.String()
	}

	if !args.MaxPrice.Equal(decimal.Zero) {
		baseQ += " AND min_price <= " + args.MaxPrice.String()
	}

	if args.Keyword != "" {
		args.Keyword = strings.ReplaceAll(args.Keyword, "%20", "%")
		args.Keyword = strings.ReplaceAll(args.Keyword, " ", "%")
		baseQ += " AND title ILIKE " + "'%" + args.Keyword + "%'"
	}

	if strings.Contains(args.Category, "LV-1") {
		baseQ += " AND category_lv1_id = " + "'" + args.Category + "'"
	}
	if strings.Contains(args.Category, "LV-2") {
		baseQ += " AND category_lv2_id = " + "'" + args.Category + "'"
	}
	if strings.Contains(args.Category, "LV-3") {
		baseQ += " AND category_lv3_id = " + "'" + args.Category + "'"
	}

	if len(args.Locations) > 0 {
		locationStr := ""
		for i, loc := range args.Locations {
			locationStr += strconv.Itoa(int(loc))
			if i != len(args.Locations)-1 {
				locationStr += ","
			}
		}
		baseQ += " AND district_code IN (" + locationStr + ") "
	}

	additionalSort := ""
	if args.SortBy != "created_at" {
		additionalSort = ", created_at DESC"
	}
	qForCount := baseQ
	if args.SortBy == shared.Recommended.Translate() {
		baseQ += " ORDER BY total_sold DESC, rating DESC"
	} else {
		baseQ += " ORDER BY " + args.SortBy + " " + args.SortOrder + additionalSort
	}

	offset := (args.Page - 1) * args.Limit
	baseQ += " LIMIT ? OFFSET ? "

	query := r.db.WithContext(ctx).Table("products").Raw(
		baseQ, args.MinRating, args.Limit, offset)

	var totalItems int64
	if err := r.db.WithContext(ctx).Table("products").Raw(qForCount, args.MinRating).Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProducts: %w", err)
	}
	totalItems = int64(len(products))

	if err := query.Find(&products).Error; err != nil {
		return nil, 0, fmt.Errorf("productRepo/ListProducts: %w", err)
	}

	return products, uint64(totalItems), nil
}

func (r *productRepo) SingleListProductByID(ctx context.Context, tx *gorm.DB, productID uint64) (*model.ListProduct, error) {
	var db *gorm.DB
	if tx != nil {
		db = tx
	} else {
		db = r.db
	}

	var product *model.ListProduct
	q := listProductBaseQuery + " WHERE p.id = ? LIMIT 1"
	if err := db.WithContext(ctx).Raw(q, productID).Scan(&product).Error; err != nil {
		return nil, fmt.Errorf("productRepo/SingleListProductByID: %w", err)
	}
	return product, nil
}

func (r *productRepo) GetDetailProduct(c context.Context, id uint64) (model.Product, error) {
	detailProduct := model.Product{}

	/* query product */
	if err := r.db.WithContext(c).Model(&model.Product{}).Where("id = ?", id).First(&detailProduct).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.Product{}, fmt.Errorf("productRepo/GetDetailProduct %w", ErrProductNotFound)
		}
		return model.Product{}, shared.ErrInternalServerError
	}
	/* query merchant*/
	merchant, err := r.merchantRepo.GetMerchantId(c, int(detailProduct.MerchantId))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.Product{}, fmt.Errorf("productRepo/GetDetailProduct %w", ErrMerchantNotFound)
		}
		return model.Product{}, shared.ErrInternalServerError
	}
	detailProduct.Merchant = *merchant

	/* query category*/
	category, err := r.categoryRepo.GetCategory(c, detailProduct.CategoryLv1Id, detailProduct.CategoryLv2Id, detailProduct.CategoryLv3Id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.Product{}, fmt.Errorf("productRepo/GetDetailProduct %w", ErrCategoryNotFound)
		}
		return model.Product{}, shared.ErrInternalServerError
	}
	detailProduct.Category = *category

	/* query photos*/
	var url []string
	err = r.db.WithContext(c).Select("url").Table("product_photos").Where("product_id = ?", id).Scan(&url).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.Product{}, shared.ErrProductNotFound
		}
		return model.Product{}, shared.ErrInternalServerError
	}
	detailProduct.Photo = url

	return detailProduct, nil
}

func (r *productRepo) IsProductExist(c context.Context, id uint64) (model.Product, error) {
	res := model.Product{}
	if err := r.db.WithContext(c).Model(&model.Product{}).Where("id=?", id).First(&res).Error; err != nil {
		return model.Product{}, fmt.Errorf("productRepo/IsProductExist %w", ErrProductNotFound)
	}
	return res, nil
}

func (r *productRepo) DeactivateProduct(c context.Context, productId uint64) error {
	tx := r.db.Begin()
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.Product{}, productId)
	if err := tx.WithContext(c).Model(&model.Product{}).Where("id=?", productId).Update("is_active", false).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("productRepo/DeactivateProduct %w", ErrInternalServerError)
	}
	tx.Commit()
	return nil
}

func (r *productRepo) ActivateProduct(c context.Context, productId uint64) error {
	tx := r.db.Begin()
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.Product{}, productId)
	if err := tx.WithContext(c).Model(&model.Product{}).Where("id=?", productId).Update("is_active", true).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("productRepo/DeactivateProduct %w", ErrInternalServerError)
	}
	tx.Commit()
	return nil
}

func (r *productRepo) GetProductFavorite(c context.Context, userId uint64) (*[]model.ListProduct, error) {
	var res *[]model.ListProduct
	err := r.db.WithContext(c).Raw(`SELECT
		p.id, u.username, p.merchant_id, p.title, p.photos, p.videos, p.total_sold,
		p.fav_count, p.average_rating, p.total_stock, a.district AS city,
		p.category_lv1_id, p.category_lv2_id, p.category_Lv3_id, mp.min_price, p.created_at, p.updated_at
		FROM products p
		INNER JOIN
			(SELECT * FROM product_favorites) as pf ON p.id=pf.product_id
		INNER JOIN
			(SELECT product_id, MIN(price) AS min_price FROM variant_combination_products GROUP BY product_id) AS mp
			ON mp.product_id = p.id
		INNER JOIN merchants m
			ON m.id = p.merchant_id
		INNER JOIN users u
			ON m.user_id = u.id
		INNER JOIN addresses a
			ON u.id = a.user_id
			AND is_shop_location IS TRUE
		WHERE p.is_active = ? and pf.user_id=?
		AND p.total_stock > ?`, true, userId, 0).Scan(&res).Error
	if err != nil {
		return nil, ErrProductNotFound
	}
	return res, nil
}

func (r *productRepo) GetProductByID(ctx context.Context, productId uint64) (*model.Product, error) {
	var product *model.Product
	err := r.db.WithContext(ctx).Model(&model.Product{}).Where("id = ?", productId).First(&product).Error
	if err != nil {
		return nil, fmt.Errorf("productRepo/GetProductByID: %w", err)
	}
	return product, nil
}

func (r *productRepo) GetProductByVariantCombinationProductId(ctx context.Context, variantCombinationProductId uint64) (*model.Product, error) {
	var product model.Product
	if err := r.db.WithContext(ctx).Model(&model.Product{}).InnerJoins(`inner join variant_combination_products as vcp on vcp.product_id=products.id`).Where(`vcp.id=?`, variantCombinationProductId).First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *productRepo) CreateProduct(ctx context.Context, merchantID uint64, createProductDTO *dto.ManageProduct) error {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		product := createProductDTO.ToProductModel()
		product.MerchantId = merchantID

		if err := tx.Create(&product).Error; err != nil {
			return err
		}

		if err := createProductPhotos(tx, product.ID, createProductDTO.Photos); err != nil {
			return err
		}

		var variantProductCreateStrategy VariantProductCreator
		if createProductDTO.Variants.Child != nil {
			variantProductCreateStrategy = NewMultiVariantProductCreator(tx, merchantID, createProductDTO)
		} else {
			variantProductCreateStrategy = NewSingleVariantProductCreator(tx, merchantID, createProductDTO)
		}

		if err := variantProductCreateStrategy.CreateProductVariant(product); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("productRepo/CreateProduct: %w", err)
	}

	return nil
}

func createProductPhotos(tx *gorm.DB, productID uint64, manageProductPhotosDTO []dto.ManageProductPhoto) error {
	for _, pp := range manageProductPhotosDTO {
		mpp := model.ProductPhoto{
			ProductId: productID,
			Url:       pp.URL,
			IsDefault: pp.IsDefault,
		}
		err := tx.Create(&mpp).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *productRepo) UpdateProduct(ctx context.Context, merchantID uint64, updateProductDTO *dto.ManageProduct) error {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		product := updateProductDTO.ToProductModel()
		product.MerchantId = merchantID
		product.ID = updateProductDTO.ID

		if err := tx.Updates(&product).Error; err != nil {
			return err
		}

		if err := updateProductPhotos(tx, updateProductDTO.ID, updateProductDTO.Photos); err != nil {
			return err
		}

		variantsDTO := updateProductDTO.Variants

		combinations, err := r.variantRepo.GetVariantCombinationsByProductID(ctx, tx, product.ID)
		if err != nil {
			return err
		}

		var variantUpdateStrategy VariantProductUpdater

		switch {
		case variantsDTO.Parent.ID != 0 && (variantsDTO.Child != nil && variantsDTO.Child.ID != 0):
			variantUpdateStrategy = NewMultiVariantExistingGroupUpdater(tx, updateProductDTO, combinations)
			variantUpdateStrategy.UpdateProductVariant(product)
		case variantsDTO.Parent.ID != 0 && variantsDTO.Child == nil:
			variantUpdateStrategy = NewSingleVariantExistingGroupUpdater(tx, updateProductDTO, combinations)
			variantUpdateStrategy.UpdateProductVariant(product)
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("productRepo/UpdateProduct: %w", err)
	}

	return nil
}

func checkIfTypeExist(typeID uint64, args ...model.VariantType) bool {
	for _, arg := range args {
		if typeID == arg.ID {
			return true
		}
	}
	return false
}

func checkIfTypeIn(typeID uint64, args ...dto.ManageVariantType) bool {
	for _, arg := range args {
		if typeID == arg.ID {
			return true
		}
	}
	return false
}

func getCombinationID(vcpid uint64, args ...model.VariantCombinationDetailResult) uint64 {
	for _, arg := range args {
		if vcpid == arg.ID {
			return arg.CombinationID
		}
	}
	return 0
}

func checkValueIDIn(n uint64, args ...uint64) (int, bool) {
	for i, arg := range args {
		if n == arg {
			return i, true
		}
	}
	return -1, false
}

func updateProductPhotos(tx *gorm.DB, productID uint64, productPhotos []dto.ManageProductPhoto) error {
	productPhotoIDs := []uint64{}
	if err := tx.Table("product_photos").
		Select("id").
		Where("product_id = ?", productID).
		Scan(&productPhotoIDs).Error; err != nil {
		return fmt.Errorf("productRepo/updateProductPhotos: %w", err)
	}

	forUpdatePhotos := []model.ProductPhoto{}
	forInsertPhotos := []model.ProductPhoto{}
	forDeletePhotoIDs := []uint64{}
	for _, photo := range productPhotos {
		idx, exist := checkValueIDIn(photo.ID, productPhotoIDs...)
		if exist {
			forUpdatePhotos = append(forUpdatePhotos, model.ProductPhoto{Id: photo.ID, Url: photo.URL, IsDefault: photo.IsDefault, ProductId: productID})
			productPhotoIDs = removeIndexFromIDs(productPhotoIDs, idx)
		} else {
			forInsertPhotos = append(forInsertPhotos, model.ProductPhoto{Url: photo.URL, IsDefault: photo.IsDefault, ProductId: productID})
		}
	}
	if len(productPhotoIDs) > 0 {
		forDeletePhotoIDs = append(forDeletePhotoIDs, productPhotoIDs...)
	}
	for _, ip := range forInsertPhotos {
		if err := tx.Create(&ip).Error; err != nil {
			return fmt.Errorf("productRepo/updateProductPhotos: %w", err)
		}
	}
	for _, up := range forUpdatePhotos {
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&up).Error; err != nil {
			return fmt.Errorf("productRepo/updateProductPhotos: %w", err)
		}
		if err := tx.Updates(&up).Error; err != nil {
			return fmt.Errorf("productRepo/updateProductPhotos: %w", err)
		}
	}
	for _, dp := range forDeletePhotoIDs { // if err := createProductCouriers(tx, product.ID, createProductDTO.Couriers); err != nil {
		// 	return err
		// }
		if err := tx.Exec("DELETE FROM product_photos WHERE id = ?", dp).Error; err != nil {
			return fmt.Errorf("productRepo/updateProductPhotos: %w", err)
		}
	}
	return nil
}

func removeIndexFromIDs(IDs []uint64, index int) []uint64 {
	copy(IDs[index:], IDs[index+1:])
	return IDs[:len(IDs)-1]
}

type (
	VariantProductCreator interface {
		CreateProductVariant(product *model.Product) error
	}

	VariantProductUpdater interface {
		UpdateProductVariant(product *model.Product) error
	}

	singleVariantProductCreator struct {
		tx               *gorm.DB
		merchantID       uint64
		createProductDTO *dto.ManageProduct
	}
	multiVariantProductCreator struct {
		tx               *gorm.DB
		merchantID       uint64
		createProductDTO *dto.ManageProduct
	}

	multiVariantExistingGroupUpdater struct {
		tx               *gorm.DB
		updateProductDTO *dto.ManageProduct
		combinations     []model.VariantCombinationDetailResult
	}

	singleVariantExistingGroupUpdater struct {
		tx               *gorm.DB
		updateProductDTO *dto.ManageProduct
		combinations     []model.VariantCombinationDetailResult
	}
)

func NewSingleVariantProductCreator(tx *gorm.DB, merchantID uint64, createProductDTO *dto.ManageProduct) VariantProductCreator {
	return &singleVariantProductCreator{
		tx:               tx,
		merchantID:       merchantID,
		createProductDTO: createProductDTO,
	}
}

func (pc *singleVariantProductCreator) CreateProductVariant(product *model.Product) error {
	parentVariantGroup := model.VariantGroup{
		MerchantId: pc.merchantID,
		GroupName:  pc.createProductDTO.Variants.Parent.Group,
	}
	err := pc.tx.Create(&parentVariantGroup).Error
	if err != nil {
		return err
	}

	for _, vt := range pc.createProductDTO.Variants.Parent.Types {
		varType := model.VariantType{
			VariantImage:   vt.Image,
			TypeName:       vt.Type,
			VariantGroupId: parentVariantGroup.ID,
		}
		err = pc.tx.Create(&varType).Error
		if err != nil {
			return err
		}

		for i, vc := range pc.createProductDTO.Variants.Combinations {
			if vc.ParentType.Type == varType.TypeName {
				parentType := dto.ManageVariantType{
					ID:    varType.ID,
					Type:  varType.TypeName,
					Image: varType.VariantImage,
				}
				variantCombination := vc
				variantCombination.ParentType = parentType
				pc.createProductDTO.Variants.Combinations[i] = variantCombination
			}
		}
	}

	totalProductStock := 0
	for _, vc := range pc.createProductDTO.Variants.Combinations {
		mvc := model.VariantCombination{
			VariantTypeParentId: vc.ParentType.ID,
		}
		err := pc.tx.Create(&mvc).Error
		if err != nil {
			return err
		}

		totalProductStock += int(vc.Stock)
		mvcp := model.VariantCombinationProduct{
			VariantCombinationId: mvc.ID,
			ProductId:            product.ID,
			Stock:                vc.Stock,
			Price:                vc.Price,
		}
		err = pc.tx.Create(&mvcp).Error
		if err != nil {
			return err
		}
	}

	product.TotalStock = uint64(totalProductStock)
	err = pc.tx.Table("products").Updates(&product).Error
	if err != nil {
		return err
	}
	return nil
}

func NewMultiVariantProductCreator(tx *gorm.DB, merchantID uint64, createProductDTO *dto.ManageProduct) VariantProductCreator {
	return &multiVariantProductCreator{
		tx:               tx,
		merchantID:       merchantID,
		createProductDTO: createProductDTO,
	}
}

func (pc *multiVariantProductCreator) CreateProductVariant(product *model.Product) error {
	parentVariantGroup := model.VariantGroup{
		MerchantId: pc.merchantID,
		GroupName:  pc.createProductDTO.Variants.Parent.Group,
	}
	err := pc.tx.Create(&parentVariantGroup).Error
	if err != nil {
		return err
	}

	for _, vt := range pc.createProductDTO.Variants.Parent.Types {
		varType := model.VariantType{
			VariantImage:   vt.Image,
			TypeName:       vt.Type,
			VariantGroupId: parentVariantGroup.ID,
		}
		err = pc.tx.Create(&varType).Error
		if err != nil {
			return err
		}

		for i, vc := range pc.createProductDTO.Variants.Combinations {
			if vc.ParentType.Type == varType.TypeName {
				parentType := dto.ManageVariantType{
					ID:    varType.ID,
					Type:  varType.TypeName,
					Image: varType.VariantImage,
				}
				variantCombination := vc
				variantCombination.ParentType = parentType
				pc.createProductDTO.Variants.Combinations[i] = variantCombination
			}
		}
	}

	childVariantGroup := model.VariantGroup{
		MerchantId: pc.merchantID,
		GroupName:  pc.createProductDTO.Variants.Child.Group,
	}
	err = pc.tx.Create(&childVariantGroup).Error
	if err != nil {
		return err
	}
	for _, vt := range pc.createProductDTO.Variants.Child.Types {
		varType := model.VariantType{
			VariantImage:   vt.Image,
			TypeName:       vt.Type,
			VariantGroupId: childVariantGroup.ID,
		}
		err = pc.tx.Create(&varType).Error
		if err != nil {
			return err
		}

		for i, vc := range pc.createProductDTO.Variants.Combinations {
			if vc.ChildType.Type == varType.TypeName {
				childType := dto.ManageVariantType{
					ID:    varType.ID,
					Type:  varType.TypeName,
					Image: varType.VariantImage,
				}
				variantCombination := vc
				variantCombination.ChildType = &childType
				pc.createProductDTO.Variants.Combinations[i] = variantCombination
			}

		}
	}

	totalProductStock := 0
	for _, vc := range pc.createProductDTO.Variants.Combinations {
		mvc := model.VariantCombination{
			VariantTypeParentId: vc.ParentType.ID,
			VariantTypeChildId:  vc.ChildType.ID,
		}
		err := pc.tx.Create(&mvc).Error
		if err != nil {
			return err
		}

		totalProductStock += int(vc.Stock)
		mvcp := model.VariantCombinationProduct{
			VariantCombinationId: mvc.ID,
			ProductId:            product.ID,
			Stock:                vc.Stock,
			Price:                vc.Price,
		}
		err = pc.tx.Create(&mvcp).Error
		if err != nil {
			return err
		}
	}

	product.TotalStock = uint64(totalProductStock)
	err = pc.tx.Table("products").Updates(&product).Error
	if err != nil {
		return err
	}
	return nil
}

func NewMultiVariantExistingGroupUpdater(tx *gorm.DB, updateProductDTO *dto.ManageProduct, combinations []model.VariantCombinationDetailResult) VariantProductUpdater {
	return &multiVariantExistingGroupUpdater{
		tx:               tx,
		updateProductDTO: updateProductDTO,
		combinations:     combinations,
	}
}

func (pu *multiVariantExistingGroupUpdater) UpdateProductVariant(product *model.Product) error {
	var existingParentTypes, existingChildTypes []model.VariantType

	if err := pu.tx.Where("variant_group_id = ?", pu.updateProductDTO.Variants.Parent.ID).Find(&existingParentTypes).Error; err != nil {
		return err
	}
	if err := pu.tx.Where("variant_group_id = ?", pu.updateProductDTO.Variants.Child.ID).Find(&existingChildTypes).Error; err != nil {
		return err
	}

	newParentTypes := []model.VariantType{}
	updateParentTypes := []model.VariantType{}
	deleteParentTypesID := []uint64{}
	for _, mvt := range pu.updateProductDTO.Variants.Parent.Types {
		if checkIfTypeExist(mvt.ID, existingParentTypes...) {
			updateParentTypes = append(updateParentTypes, model.VariantType{ID: mvt.ID, TypeName: mvt.Type, VariantImage: mvt.Image, VariantGroupId: pu.updateProductDTO.Variants.Parent.ID})
		} else {
			newParentTypes = append(newParentTypes, model.VariantType{TypeName: mvt.Type, VariantImage: mvt.Image, VariantGroupId: pu.updateProductDTO.Variants.Parent.ID})
		}
	}
	for _, t := range existingParentTypes {
		if !checkIfTypeIn(t.ID, pu.updateProductDTO.Variants.Parent.Types...) {
			deleteParentTypesID = append(deleteParentTypesID, t.ID)
		}
	}
	for _, t := range updateParentTypes {
		if err := pu.tx.Updates(&t).Error; err != nil {
			return err
		}
	}
	for _, t := range newParentTypes {
		if err := pu.tx.Create(&t).Error; err != nil {
			return err
		}
		for _, vc := range pu.updateProductDTO.Variants.Combinations {
			if vc.ParentType.Type == t.TypeName {
				vc.ParentType.ID = t.ID
			}
		}
	}
	for _, id := range deleteParentTypesID {
		if err := pu.tx.Exec("DELETE FROM variant_types WHERE id = ?", id).Error; err != nil {
			return err
		}
	}
	newChildTypes := []model.VariantType{}
	updateChildTypes := []model.VariantType{}
	deleteChildTypesID := []uint64{}
	for _, mvt := range pu.updateProductDTO.Variants.Child.Types {
		if checkIfTypeExist(mvt.ID, existingChildTypes...) {
			updateChildTypes = append(updateChildTypes, model.VariantType{ID: mvt.ID, TypeName: mvt.Type, VariantImage: mvt.Image, VariantGroupId: pu.updateProductDTO.Variants.Child.ID})
		} else {
			newChildTypes = append(newChildTypes, model.VariantType{TypeName: mvt.Type, VariantImage: mvt.Image, VariantGroupId: pu.updateProductDTO.Variants.Child.ID})
		}
	}
	for _, t := range existingChildTypes {
		if !checkIfTypeIn(t.ID, pu.updateProductDTO.Variants.Child.Types...) {
			deleteChildTypesID = append(deleteChildTypesID, t.ID)
		}
	}
	if len(updateChildTypes) > 0 {
		for _, t := range updateChildTypes {
			if err := pu.tx.Updates(&t).Error; err != nil {
				return err
			}
		}
	}
	if len(newChildTypes) > 0 {
		for _, t := range newChildTypes {
			if err := pu.tx.Create(&t).Error; err != nil {
				return err
			}
			for _, vc := range pu.updateProductDTO.Variants.Combinations {
				if vc.ChildType.Type == t.TypeName {
					vc.ChildType.ID = t.ID
				}
			}
		}
	}
	if len(deleteChildTypesID) > 0 {
		for _, id := range deleteChildTypesID {
			if err := pu.tx.Exec("DELETE FROM variant_types WHERE id = ?", id).Error; err != nil {
				return err
			}
		}
	}

	combinationsIDs := []uint64{}
	for _, c := range pu.combinations {
		combinationsIDs = append(combinationsIDs, c.ID)
	}

	forUpdateCombinations := []model.VariantCombinationProduct{}
	newCombinations := []dto.ManageVariantCombination{}
	forDeleteCombinations := []model.VariantCombinationProduct{}
	for _, mvc := range pu.updateProductDTO.Variants.Combinations {
		idx, exist := checkValueIDIn(mvc.ID, combinationsIDs...)
		if exist {
			combinationID := getCombinationID(mvc.ID, pu.combinations...)
			forUpdateCombinations = append(forUpdateCombinations, model.VariantCombinationProduct{ID: mvc.ID, VariantCombinationId: combinationID, ProductId: pu.updateProductDTO.ID, Stock: mvc.Stock, Price: mvc.Price})
			combinationsIDs = removeIndexFromIDs(combinationsIDs, idx)
		} else {
			newCombinations = append(newCombinations, mvc)
		}
	}
	if len(combinationsIDs) > 0 {
		for _, mvc := range pu.updateProductDTO.Variants.Combinations {
			_, exist := checkValueIDIn(mvc.ID, combinationsIDs...)
			if exist {
				combinationID := getCombinationID(mvc.ID, pu.combinations...)
				forDeleteCombinations = append(forDeleteCombinations, model.VariantCombinationProduct{ID: mvc.ID, VariantCombinationId: combinationID, ProductId: pu.updateProductDTO.ID, Stock: mvc.Stock, Price: mvc.Price})
			}
		}
	}
	if len(forUpdateCombinations) > 0 {
		for _, c := range forUpdateCombinations {
			var updatedCombination model.VariantCombinationProduct
			if err := pu.tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", c.ID).First(&updatedCombination).Error; err != nil {
				return err
			}
			updatedCombination.Price = c.Price
			updatedCombination.Stock = c.Stock
			updatedCombination.UpdatedAt = time.Now()

			err := pu.tx.Save(&c).Error
			if err != nil {
				return err
			}
		}
	}
	if len(forDeleteCombinations) > 0 {
		for _, c := range forDeleteCombinations {
			var vc model.VariantCombination
			if err := pu.tx.Table("variant_combinations").Where("id = ?", c.VariantCombinationId).First(&vc).Error; err != nil {
				return err
			}
			if err := pu.tx.Exec("DELETE FROM variant_combination_products WHERE id = ?", c.ID).Error; err != nil {
				return err
			}
			if err := pu.tx.Exec("DELETE FROM variant_combinations WHERE id = ?", vc.ID).Error; err != nil {
				return err
			}
		}
	}
	if len(newCombinations) > 0 {
		for _, c := range newCombinations {
			newCombination := &model.VariantCombination{VariantTypeParentId: c.ParentType.ID, VariantTypeChildId: c.ChildType.ID}
			if err := pu.tx.Create(&newCombination).Error; err != nil {
				return err
			}
			if err := pu.tx.Create(&model.VariantCombinationProduct{VariantCombinationId: newCombination.ID, ProductId: c.ID, Stock: c.Stock, Price: c.Price}).Error; err != nil {
				return err
			}
		}
	}

	updatedStock := uint64(0)
	for _, mvc := range pu.updateProductDTO.Variants.Combinations {
		updatedStock += mvc.Stock
	}

	if err := pu.tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", product.ID).First(&product).Error; err != nil {
		return err
	}

	product.TotalStock = updatedStock
	product.UpdatedAt = time.Now()

	if err := pu.tx.Save(&product).Error; err != nil {
		return err
	}
	return nil
}

func NewSingleVariantExistingGroupUpdater(tx *gorm.DB, updateproductDTO *dto.ManageProduct, combinations []model.VariantCombinationDetailResult) VariantProductUpdater {
	return &singleVariantExistingGroupUpdater{
		tx:               tx,
		updateProductDTO: updateproductDTO,
		combinations:     combinations,
	}
}

func (pu *singleVariantExistingGroupUpdater) UpdateProductVariant(product *model.Product) error {
	var existingParentTypes []model.VariantType

	if err := pu.tx.Where("variant_group_id = ?", pu.updateProductDTO.Variants.Parent.ID).Find(&existingParentTypes).Error; err != nil {
		return err
	}

	newParentTypes := []model.VariantType{}
	updateParentTypes := []model.VariantType{}
	deleteParentTypesID := []uint64{}
	for _, mvt := range pu.updateProductDTO.Variants.Parent.Types {
		if checkIfTypeExist(mvt.ID, existingParentTypes...) {
			updateParentTypes = append(updateParentTypes, model.VariantType{ID: mvt.ID, TypeName: mvt.Type, VariantImage: mvt.Image, VariantGroupId: pu.updateProductDTO.Variants.Parent.ID})
		} else {
			newParentTypes = append(newParentTypes, model.VariantType{TypeName: mvt.Type, VariantImage: mvt.Image, VariantGroupId: pu.updateProductDTO.Variants.Parent.ID})
		}
	}
	for _, t := range existingParentTypes {
		if !checkIfTypeIn(t.ID, pu.updateProductDTO.Variants.Parent.Types...) {
			deleteParentTypesID = append(deleteParentTypesID, t.ID)
		}
	}
	for _, t := range updateParentTypes {
		if err := pu.tx.Updates(&t).Error; err != nil {
			return err
		}
	}
	for _, t := range newParentTypes {
		if err := pu.tx.Create(&t).Error; err != nil {
			return err
		}
		for _, vc := range pu.updateProductDTO.Variants.Combinations {
			if vc.ParentType.Type == t.TypeName {
				vc.ParentType.ID = t.ID
			}
		}
	}
	for _, id := range deleteParentTypesID {
		if err := pu.tx.Exec("DELETE FROM variant_types WHERE id = ?", id).Error; err != nil {
			return err
		}
	}

	combinationsIDs := []uint64{}
	for _, c := range pu.combinations {
		combinationsIDs = append(combinationsIDs, c.ID)
	}

	forUpdateCombinations := []model.VariantCombinationProduct{}
	newCombinations := []dto.ManageVariantCombination{}
	forDeleteCombinations := []model.VariantCombinationProduct{}
	for _, mvc := range pu.updateProductDTO.Variants.Combinations {
		idx, exist := checkValueIDIn(mvc.ID, combinationsIDs...)
		if exist {
			combinationID := getCombinationID(mvc.ID, pu.combinations...)
			forUpdateCombinations = append(forUpdateCombinations, model.VariantCombinationProduct{ID: mvc.ID, VariantCombinationId: combinationID, ProductId: pu.updateProductDTO.ID, Stock: mvc.Stock, Price: mvc.Price})
			combinationsIDs = removeIndexFromIDs(combinationsIDs, idx)
		} else {
			newCombinations = append(newCombinations, mvc)
		}
	}
	if len(combinationsIDs) > 0 {
		for _, mvc := range pu.updateProductDTO.Variants.Combinations {
			_, exist := checkValueIDIn(mvc.ID, combinationsIDs...)
			if exist {
				combinationID := getCombinationID(mvc.ID, pu.combinations...)
				forDeleteCombinations = append(forDeleteCombinations, model.VariantCombinationProduct{ID: mvc.ID, VariantCombinationId: combinationID, ProductId: pu.updateProductDTO.ID, Stock: mvc.Stock, Price: mvc.Price})
			}
		}
	}
	if len(forUpdateCombinations) > 0 {
		for _, c := range forUpdateCombinations {
			var updatedCombination model.VariantCombinationProduct
			if err := pu.tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", c.ID).First(&updatedCombination).Error; err != nil {
				return err
			}
			updatedCombination.Price = c.Price
			updatedCombination.Stock = c.Stock
			updatedCombination.UpdatedAt = time.Now()

			err := pu.tx.Save(&updatedCombination).Error
			if err != nil {
				return err
			}
		}
	}
	if len(forDeleteCombinations) > 0 {
		for _, c := range forDeleteCombinations {
			var vc model.VariantCombination
			if err := pu.tx.Table("variant_combinations").Where("id = ?", c.VariantCombinationId).First(&vc).Error; err != nil {
				return err
			}
			if err := pu.tx.Exec("DELETE FROM variant_combination_products WHERE id = ?", c.ID).Error; err != nil {
				return err
			}
			if err := pu.tx.Exec("DELETE FROM variant_combinations WHERE id = ?", vc.ID).Error; err != nil {
				return err // if err := createProductCouriers(tx, product.ID, createProductDTO.Couriers); err != nil {
				// 	return err
				// }
			}
		}
	}
	if len(newCombinations) > 0 {
		for _, c := range newCombinations {
			newCombination := &model.VariantCombination{VariantTypeParentId: c.ParentType.ID}
			if err := pu.tx.Create(&newCombination).Error; err != nil {
				return err
			}
			if err := pu.tx.Create(&model.VariantCombinationProduct{VariantCombinationId: newCombination.ID, ProductId: c.ID, Stock: c.Stock, Price: c.Price}).Error; err != nil {
				return err
			}
		}
	}

	updatedStock := uint64(0)
	for _, mvc := range pu.updateProductDTO.Variants.Combinations {
		updatedStock += mvc.Stock
	}

	if err := pu.tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", product.ID).First(&product).Error; err != nil {
		return err
	}

	product.TotalStock = updatedStock
	product.UpdatedAt = time.Now()

	if err := pu.tx.Save(&product).Error; err != nil {
		return err
	}
	return nil
}
