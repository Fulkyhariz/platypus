package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"errors"
	"fmt"
	"math"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type productUsecase struct {
	repo *repo.Repo
}

type ProductUsecase interface {
	ListProductsByMerchantID(ctx context.Context, merchantID uint64, args dto.ListProductByMerchantQueries) ([]dto.ListProduct, *dto.PaginationInfo, error)
	ListProducts(ctx context.Context, args dto.ListProductQueries) ([]dto.ListProduct, *dto.PaginationInfo, error)
	GetDetailProduct(c context.Context, id uint64) (*dto.ProductDetail, error)
	ListProductsByMerchantUsername(ctx context.Context, username string, args dto.ListProductByMerchantQueries) ([]dto.ListProduct, *dto.PaginationInfo, error)
	DeactivateProduct(c context.Context, productId uint64, userId uint64) error
	ActivateProduct(c context.Context, productId uint64, userId uint64) error
	CreateProduct(ctx context.Context, userID uint64, createProductDTO *dto.ManageProduct) error
	GetProductForEdit(ctx context.Context, userInfo *dto.UserInfo, productID uint64) (*dto.ManageProduct, error)
	UpdateProduct(ctx context.Context, userInfo *dto.UserInfo, updateProductDTO *dto.ManageProduct) error
}

func NewProductUsecase(repo *repo.Repo) ProductUsecase {
	return &productUsecase{
		repo: repo,
	}
}

func (u *productUsecase) ListProductsByMerchantID(ctx context.Context, merchantID uint64, args dto.ListProductByMerchantQueries) ([]dto.ListProduct, *dto.PaginationInfo, error) {
	products, totalItems, err := u.repo.ProductRepo.ListProductsByMerchantID(ctx, merchantID, args)
	if err != nil {
		return nil, nil, fmt.Errorf("productUsecase/ListProductsByMerchantID: %s: %w", ErrFailedGettingProductsData, err)
	}

	pageInfo := dto.PaginationInfo{
		TotalItems:  int64(totalItems),
		TotalPages:  (int64(totalItems) + int64(args.Limit) - 1) / int64(args.Limit),
		CurrentPage: int64(args.Page),
	}

	return fillListProductDTOs(products), &pageInfo, nil
}

func (u *productUsecase) ListProductsByMerchantUsername(ctx context.Context, username string, args dto.ListProductByMerchantQueries) ([]dto.ListProduct, *dto.PaginationInfo, error) {
	user, err := u.repo.UserRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, nil, fmt.Errorf("productUsecase/ListProductsByMerchantUsername: %s: %w", ErrFailedGettingProductsData, err)
	}

	products, totalItems, err := u.repo.ProductRepo.ListProductsByUserID(ctx, user.ID, args)
	if err != nil {
		return nil, nil, fmt.Errorf("productUsecase/ListProductsByMerchantUsername: %s: %w", ErrFailedGettingProductsData, err)
	}

	pageInfo := dto.PaginationInfo{
		TotalItems:  int64(totalItems),
		TotalPages:  (int64(totalItems) + int64(args.Limit) - 1) / int64(args.Limit),
		CurrentPage: int64(args.Page),
	}

	return fillListProductDTOs(products), &pageInfo, nil
}

func (u *productUsecase) ListProducts(ctx context.Context, args dto.ListProductQueries) ([]dto.ListProduct, *dto.PaginationInfo, error) {
	products, totalItems, err := u.repo.ProductRepo.ListProducts(ctx, args)
	if err != nil {
		return nil, nil, fmt.Errorf("productUsecase/ListProducts: %s: %w", ErrFailedGettingProductsData, err)
	}

	pageInfo := dto.PaginationInfo{
		TotalItems:  int64(totalItems),
		TotalPages:  (int64(totalItems) + int64(args.Limit) - 1) / int64(args.Limit),
		CurrentPage: int64(args.Page),
	}

	return fillListProductDTOs(products), &pageInfo, nil
}

func fillListProductDTOs(products []model.ListProduct) []dto.ListProduct {
	productDTOs := make([]dto.ListProduct, len(products))
	for i, p := range products {
		productDTOs[i] = *dto.ListProductToDTO(p)
	}
	return productDTOs
}

func (u *productUsecase) GetDetailProduct(c context.Context, productId uint64) (*dto.ProductDetail, error) {
	product, err := u.repo.ProductRepo.GetDetailProduct(c, productId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &dto.ProductDetail{}, shared.ErrProductNotFound
		}
		return nil, err
	}

	merchant, err := u.repo.MerchantRepo.IsMerchantExist(c, product.MerchantId)

	if err != nil {
		return nil, err
	}

	variant, err := u.repo.VariantRepo.GetVariantProduct(c, productId, product.MerchantId)
	if err != nil {
		return nil, err
	}

	if len(variant) == 0 {
		return nil, fmt.Errorf("productUsecase/GetDetailProduct %w", ErrVariantNotFound)
	}
	maxPrice := variant[0].Price
	minPrice := variant[0].Price
	variantMap := make(map[string]*model.VariantParent)
	for i := 0; i < len(variant); i++ {
		typeNameParent, groupNameParent := variant[i].TypeNameParent, variant[i].GroupNameParent
		typeNameChild, groupNameChild := variant[i].TypeNameChild, variant[i].GroupNameChild
		if variant[i].Price.GreaterThan(maxPrice) {
			maxPrice = variant[i].Price
		}
		if variant[i].Price.LessThan(minPrice) {
			minPrice = variant[i].Price
		}

		if variantMap[typeNameParent] == nil {
			if typeNameChild == "" {
				variantMap[variant[i].TypeNameParent] = &model.VariantParent{VariantCombinationProductId: variant[i].VariantCombinationProductId, ParentName: typeNameParent, ParentGroup: groupNameParent, Stock: variant[i].Stock, Price: variant[i].Price, ParentPicture: variant[i].VariantImage}
				continue
			}
			variantMap[variant[i].TypeNameParent] = &model.VariantParent{ParentName: typeNameParent, ParentGroup: groupNameParent, ParentPicture: variant[i].VariantImage, VariantChild: []model.VariantChild{{ChildName: typeNameChild, ChildGroup: groupNameChild, Price: variant[i].Price, Stock: variant[i].Stock, VariantCombinationProductId: variant[i].VariantCombinationProductId}}}
		} else {
			if typeNameChild == "" {
				continue
			}
			child := append(variantMap[typeNameParent].VariantChild, model.VariantChild{ChildName: typeNameChild, ChildGroup: groupNameChild, Price: variant[i].Price, Stock: variant[i].Stock, VariantCombinationProductId: variant[i].VariantCombinationProductId})
			variantMap[typeNameParent].VariantChild = child
		}
	}

	username, err := u.repo.UserRepo.FindUsernameById(c, merchant.UserID)
	if err != nil {
		return nil, err
	}

	resultVariant := []model.VariantParent{}

	for _, v := range variantMap {
		resultVariant = append(resultVariant, *v)
	}

	/*Get Photo on Product*/
	image, err := u.repo.ProductPhotoRepo.GetProductPhotoByProductId(c, productId)
	if err != nil {
		return nil, err
	}
	var defaulImage string
	listImage := make([]string, 0)
	if len(image) == 0 {
		return nil, fmt.Errorf("productUsecase/GetDetailProduct %w", ErrPhotoNotFound)
	}
	defaulImage = image[0].Url
	if len(image) > 1 {
		for i := 1; i < len(image); i++ {
			listImage = append(listImage, image[i].Url)
		}
	}

	return &dto.ProductDetail{
		Id:            product.ID,
		ProductName:   product.Title,
		Description:   product.Description,
		AverageRating: math.Round(product.AverageRating*100) / 100,
		FavoriteCount: product.FavCount,
		DefaultPhoto:  defaulImage,
		Photos:        listImage,
		MinPrice:      minPrice,
		MaxPrice:      maxPrice,
		Username:      username,
		IsHazardous:   product.IsHazardous,
		IsUsed:        product.IsUsed,
		Width:         product.Width,
		Length:        product.Length,
		Height:        product.Height,
		Weight:        product.Weight,
		Category:      product.Category,
		Merchant:      product.Merchant,
		Variant:       resultVariant,
		TotalRating:   product.TotalRating,
		TotalSold:     product.TotalSold,
		CreatedAt:     product.CreatedAt,
		UpdatedAt:     product.UpdatedAt,
	}, nil
}

func (u *productUsecase) DeactivateProduct(c context.Context, productId uint64, userId uint64) error {
	product, err := u.repo.ProductRepo.IsProductExist(c, productId)
	if err != nil {
		return err
	}
	merchant, err := u.repo.MerchantRepo.GetMerchantByUserId(c, userId)
	if err != nil {
		return err
	}
	if product.MerchantId != merchant.ID {
		return fmt.Errorf("productUsecase/DeactivateProduct %w", ErrUnauthorizedProduct)
	}
	if err := u.repo.ProductRepo.DeactivateProduct(c, productId); err != nil {
		return err
	}
	return nil
}

func (u *productUsecase) ActivateProduct(c context.Context, productId uint64, userId uint64) error {
	product, err := u.repo.ProductRepo.IsProductExist(c, productId)
	if err != nil {
		return err
	}
	merchant, err := u.repo.MerchantRepo.GetMerchantByUserId(c, userId)
	if err != nil {
		return err
	}
	if product.MerchantId != merchant.ID {
		return fmt.Errorf("productUsecase/DeactivateProduct %w", ErrUnauthorizedProduct)
	}
	if err := u.repo.ProductRepo.ActivateProduct(c, productId); err != nil {
		return err
	}
	return nil
}

func (u *productUsecase) CreateProduct(ctx context.Context, userID uint64, createProductDTO *dto.ManageProduct) error {
	merchant, err := u.repo.MerchantRepo.FindMerchantByUserID(ctx, userID)
	if err != nil {
		return fmt.Errorf("productUsecase/CreateProduct: %s: %w", ErrFailedCreateProduct, err)
	}
	err = u.repo.ProductRepo.CreateProduct(ctx, merchant.ID, createProductDTO)
	if err != nil {
		return fmt.Errorf("productUsecase/CreateProduct: %s: %w", ErrFailedCreateProduct, err)
	}
	return nil
}

func (u *productUsecase) GetProductForEdit(ctx context.Context, userInfo *dto.UserInfo, productID uint64) (*dto.ManageProduct, error) {
	product, err := u.repo.ProductRepo.GetProductByID(ctx, productID)
	if err != nil {
		return nil, fmt.Errorf("productUsecase/GetProductForEdit: %s: %w", ErrFailedGettingProductsData, err)
	}

	if product.MerchantId != *userInfo.MerchantId {
		return nil, fmt.Errorf("productUsecase/GetProductForEdit: %s: %w", ErrFailedGettingProductsData, ErrWrongUserTryingToAccessMerchant)
	}

	res := dto.ModelToManageProduct(product)

	photos, err := u.repo.ProductPhotoRepo.GetProductPhotoByProductId(ctx, productID)
	if err != nil {
		return nil, fmt.Errorf("productUsecase/GetProductForEdit: %s: %w", ErrFailedGettingProductsData, err)
	}
	for _, pp := range photos {
		res.Photos = append(res.Photos, *dto.ModelToManageProductPhoto(&pp))
	}

	combinations, err := u.repo.VariantRepo.GetVariantCombinationsByProductID(ctx, nil, productID)
	if err != nil {
		return nil, fmt.Errorf("productUsecase/GetProductForEdit: %s: %w", ErrFailedGettingProductsData, err)
	}

	var parentGroup, childGroup *dto.ManageVariantGroup
	variantCombinations := []dto.ManageVariantCombination{}
	parentTypes := []dto.ManageVariantType{}
	childTypes := []dto.ManageVariantType{}

	for _, c := range combinations {
		mvc := &dto.ManageVariantCombination{
			ID:    c.ID,
			Stock: c.Stock,
			Price: decimal.NewFromFloat(c.Price),
		}

		if parentGroup == nil {
			parentGroup = &dto.ManageVariantGroup{
				ID:    c.ParentGroupID,
				Group: c.ParentGroupName,
			}
		}

		parentType := &dto.ManageVariantType{ID: c.ParentTypeID, Type: c.ParentTypeName, Image: c.ParentTypeImage}
		mvc.ParentType = *parentType
		if !checkIfVariantTypeExist(c.ParentTypeID, parentTypes) {
			parentTypes = append(parentTypes, *parentType)
		}

		if c.ChildGroupID != 0 {
			if childGroup == nil {
				childGroup = &dto.ManageVariantGroup{
					ID:    c.ChildGroupID,
					Group: c.ChildGroupName,
				}
			}
			childType := &dto.ManageVariantType{ID: c.ChildTypeID, Type: c.ChildTypeName, Image: c.ChildTypeImage}
			mvc.ChildType = childType
			if !checkIfVariantTypeExist(c.ChildTypeID, childTypes) {
				childTypes = append(childTypes, *childType)
			}
		}
		variantCombinations = append(variantCombinations, *mvc)
	}
	parentGroup.Types = parentTypes
	if childGroup != nil {
		childGroup.Types = childTypes
	}
	res.Variants = dto.ManageVariant{
		Parent:       *parentGroup,
		Child:        childGroup,
		Combinations: variantCombinations,
	}

	return res, nil
}

func (u *productUsecase) UpdateProduct(ctx context.Context, userInfo *dto.UserInfo, updateProductDTO *dto.ManageProduct) error {
	p, err := u.repo.ProductRepo.GetProductByID(ctx, updateProductDTO.ID)
	if err != nil {
		return fmt.Errorf("productUsecase/UpdateProduct: %s: %w", ErrFailedUpdateProduct, err)
	}

	if p.MerchantId != *userInfo.MerchantId {
		return fmt.Errorf("productUsecase/UpdateProduct: %s: %w", ErrWrongUserTryingToAccessMerchant, err)
	}

	err = u.repo.ProductRepo.UpdateProduct(ctx, p.MerchantId, updateProductDTO)
	if err != nil {
		return fmt.Errorf("productUsecase/UpdateProduct: %s: %w", ErrFailedUpdateProduct, err)
	}

	return nil
}

func checkIfVariantTypeExist(varTypeID uint64, varTypeArr []dto.ManageVariantType) bool {
	for _, vt := range varTypeArr {
		if varTypeID == vt.ID {
			return true
		}
	}
	return false
}
