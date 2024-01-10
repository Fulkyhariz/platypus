package handler

import (
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type ProductHandler struct {
	usecase *usecase.Usecase
}

func NewProductHandler(usecase *usecase.Usecase) *ProductHandler {
	return &ProductHandler{
		usecase: usecase,
	}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()

	resData, resMetaPageInfo, err := h.usecase.ProductUsecase.ListProducts(ctx, *getListProductsQueries(c))
	if err != nil {
		httpErr = shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: fillListProductsResponse(resData), Meta: &dto.Meta{PaginationInfo: *resMetaPageInfo}})
}

func getListProductsQueries(c *gin.Context) *dto.ListProductQueries {
	p, err := strconv.Atoi(c.Query("page"))
	if err != nil {
		p = 1
	}

	limit, err := strconv.Atoi(c.Query("limit"))
	if err != nil {
		limit = 30
	}

	minRating, err := strconv.Atoi(c.Query("min_rating"))
	if err != nil {
		minRating = 0
	}

	minPrice, err := decimal.NewFromString(c.Query("min_price"))
	if err != nil {
		minPrice = decimal.Zero
	}

	maxPrice, err := decimal.NewFromString(c.Query("max_price"))
	if err != nil {
		maxPrice = decimal.Zero
	}

	locations := strings.Split(c.Query("location"), ",")
	locationIDs := []uint64{}
	if len(locations) > 0 {
		for _, location := range locations {
			locationID, err := strconv.Atoi(location)
			if err == nil {
				locationIDs = append(locationIDs, uint64(locationID))
			}
		}
	}

	sortCriteria := c.Query("sort_by")
	if !utils.CheckValueStringIn(sortCriteria, shared.TotalSold.String(), shared.Rating.String(), shared.Date.String(), shared.Price.String()) {
		sortCriteria = shared.Recommended.Translate()
	} else {
		switch sortCriteria {
		case shared.TotalSold.String():
			sortCriteria = shared.TotalSold.Translate()
		case shared.Rating.String():
			sortCriteria = shared.Rating.Translate()
		case shared.Date.String():
			sortCriteria = shared.Date.Translate()
		case shared.Price.String():
			sortCriteria = shared.Price.Translate()
		}
	}

	sortOrder := strings.ToUpper(c.Query("sort"))
	if !utils.CheckValueStringIn(sortOrder, shared.ASC.String(), shared.DESC.String()) {
		if utils.CheckValueStringIn(sortCriteria, shared.Rating.Translate(), shared.TotalSold.Translate()) {
			sortOrder = shared.DESC.String()
		} else {
			sortOrder = shared.ASC.String()
		}
	}

	return &dto.ListProductQueries{
		Keyword:   c.Query("q"),
		MinRating: uint64(minRating),
		MinPrice:  minPrice,
		MaxPrice:  maxPrice,
		Locations: locationIDs,
		SortBy:    sortCriteria,
		SortOrder: sortOrder,
		Page:      uint64(p),
		Limit:     uint64(limit),
		Category:  strings.ToUpper(c.Query("category")),
	}
}

func (h *ProductHandler) ProductDetail(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	query := c.Param("id")
	id, err := strconv.Atoi(query)
	if err != nil {
		httpError = shared.ErrPageNotFound
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	res, err := h.usecase.ProductUsecase.GetDetailProduct(ctx, uint64(id))

	if err != nil {
		if errors.Is(err, repo.ErrProductNotFound) {
			httpError = shared.ErrProductNotFound
		}
		if errors.Is(err, repo.ErrMerchantNotFound) {
			httpError = shared.ErrMerchantNotFound
		}
		if errors.Is(err, repo.ErrCategoryNotFound) {
			httpError = shared.ErrCategoryNotFound
		}
		if errors.Is(err, usecase.ErrVariantNotFound) {
			httpError = shared.ErrVariantNotFound
		}
		if errors.Is(err, usecase.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		if errors.Is(err, usecase.ErrPhotoNotFound) {
			httpError = shared.ErrPhotoNotFound
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: res})
}

func (h *ProductHandler) DeactivateProduct(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	var req dto.DeactivateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("ProductFavouriteHandler/DeactivateProduct: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.ProductUsecase.DeactivateProduct(ctx, req.ProductId, user.ID); err != nil {
		if errors.Is(err, usecase.ErrUnauthorizedProduct) {
			httpError = shared.ErrUnauthorizedAccess
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully deactivate product"})
}

func (h *ProductHandler) ActivateProduct(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	var req dto.DeactivateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("ProductFavouriteHandler/ActivateProduct: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.ProductUsecase.ActivateProduct(ctx, req.ProductId, user.ID); err != nil {
		if errors.Is(err, usecase.ErrUnauthorizedProduct) {
			httpError = shared.ErrUnauthorizedAccess
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully activate product"})
}

func (h *ProductHandler) CreateProductHandler(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	var req dto.ManageProductRequest

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpError = shared.ErrUnauthorizedAccess
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	createProductDTO, err := req.ToDTO()
	if err != nil {
		httpError = shared.ErrInternalServerError
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	err = h.usecase.ProductUsecase.CreateProduct(ctx, user.ID, createProductDTO)
	if err != nil {
		httpError = shared.ErrInternalServerError
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, &dto.JSONResponse{Message: "Successfully created product"})
}

func (h *ProductHandler) EditProductHandler(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpError = shared.ErrUnauthorizedAccess
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	if !user.IsSeller {
		httpError = shared.ErrForbiddenResource
		_ = c.Error(&httpError)
		return
	}

	id := c.Param("id")
	productID, err := strconv.Atoi(id)
	if err != nil {
		httpError = shared.ErrProductNotFound
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	editProductDTO, err := h.usecase.ProductUsecase.GetProductForEdit(ctx, user, uint64(productID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpError = shared.ErrProductNotFound
		} else if errors.Is(err, usecase.ErrWrongUserTryingToAccessMerchant) {
			httpError = shared.ErrForbiddenResource
		} else {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, &dto.JSONResponse{Data: editProductDTO.ToResponse()})
}

func (h *ProductHandler) UpdateProductHandler(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	var req dto.ManageProductRequest

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpError = shared.ErrUnauthorizedAccess
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	if !user.IsSeller {
		httpError = shared.ErrForbiddenResource
		_ = c.Error(&httpError)
		return
	}

	id := c.Param("id")
	productID, err := strconv.Atoi(id)
	if err != nil {
		httpError = shared.ErrProductNotFound
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	if productID != int(req.ID) {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	updateProductDTO, err := req.ToDTO()
	if err != nil {
		httpError = shared.ErrInternalServerError
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	err = h.usecase.ProductUsecase.UpdateProduct(ctx, user, updateProductDTO)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpError = shared.ErrProductNotFound
		} else {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, &dto.JSONResponse{Message: "Successfully updated product"})
}
