package handler

import (
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MerchantHandler struct {
	usecase *usecase.Usecase
}

func NewMerchantHandler(usecase *usecase.Usecase) *MerchantHandler {
	return &MerchantHandler{
		usecase: usecase,
	}
}

func (h *MerchantHandler) GetMerchantHandler(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()

	username := c.Param("username")

	res, err := h.usecase.MerchantUsecase.GetMerchantByUsername(ctx, username)
	if err != nil {
		if utils.CheckErrorIn(err, repo.ErrMerchantNotFound, gorm.ErrRecordNotFound) {
			httpErr = shared.ErrMerchantNotFound
		} else {
			httpErr = shared.ErrInternalServerError
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res.ToResponse()})
}

func (h *MerchantHandler) GetMerchantProductsHandler(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()

	username := c.Param("username")

	resData, resMetaPageInfo, err := h.usecase.ProductUsecase.ListProductsByMerchantUsername(ctx, username, *getListProductsByMerchantQueries(c))
	if err != nil {
		if utils.CheckErrorIn(err, repo.ErrMerchantNotFound, gorm.ErrRecordNotFound) {
			httpErr = shared.ErrMerchantNotFound
		} else {
			httpErr = shared.ErrInternalServerError
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: fillListProductsResponse(resData), Meta: &dto.Meta{PaginationInfo: *resMetaPageInfo}})
}

func (h *MerchantHandler) GetMerchantCategoriesHandler(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()

	username := c.Param("username")

	res, err := h.usecase.CategoryUsecase.ListCategoriesByMerchantUsername(ctx, username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpErr = shared.ErrMerchantNotFound
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res})
}

func getListProductsByMerchantQueries(c *gin.Context) *dto.ListProductByMerchantQueries {
	p, err := strconv.Atoi(c.Query("page"))
	if err != nil {
		p = 1
	}

	limit, err := strconv.Atoi(c.Query("limit"))
	if err != nil {
		limit = 20
	}

	sortCriteria := c.Query("sort_by")
	if !utils.CheckValueStringIn(sortCriteria, shared.TotalSold.String(), shared.Rating.String(), shared.Date.String(), shared.Price.String()) {
		sortCriteria = shared.TotalSold.Translate()
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
		if sortCriteria == shared.TotalSold.Translate() {
			sortOrder = shared.DESC.String()
		} else {
			sortOrder = shared.ASC.String()
		}
	}

	excludeNoStock := c.Query("exclude_no_stock")
	var excludeNoStockStatus bool
	switch excludeNoStock {
	case shared.True.String():
		excludeNoStockStatus = shared.True.Bool()
	default:
		excludeNoStockStatus = shared.False.Bool()
	}

	excludeNotActive := c.Query("exclude_not_active")
	var excludeNotActiveStatus bool
	switch excludeNotActive {
	case shared.True.String():
		excludeNotActiveStatus = shared.True.Bool()
	default:
		excludeNotActiveStatus = shared.False.Bool()
	}

	return &dto.ListProductByMerchantQueries{
		Keyword:          c.Query("q"),
		SortBy:           sortCriteria,
		SortOrder:        sortOrder,
		Page:             uint64(p),
		Limit:            uint64(limit),
		Category:         strings.ToUpper(c.Query("category")),
		ExcludeNoStock:   excludeNoStockStatus,
		ExcludeNotActive: excludeNotActiveStatus,
	}
}

func fillListProductsResponse(products []dto.ListProduct) []dto.ListProductsResponse {
	listProductResponse := make([]dto.ListProductsResponse, len(products))
	for i, p := range products {
		listProductResponse[i] = *p.ToResponse()
	}
	return listProductResponse
}

func (h *MerchantHandler) GetMerchantPromotionsHandler(c *gin.Context) {
	var httpError shared.HTTPError
	ctx := c.Request.Context()
	username := c.Param("username")

	promotions, pageInfo, err := h.usecase.PromotionUsecase.ListMerchantPromotionsByUsername(ctx, username, getListPromotionQueries(c))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpError = shared.ErrMerchantNotFound
		} else {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	res := []dto.ListMerchantPromotionResponse{}
	for _, promo := range promotions {
		res = append(res, *promo.ToListMerchantPromotionResponse())
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res, Meta: &dto.Meta{PaginationInfo: *pageInfo}})
}

func getListPromotionQueries(c *gin.Context) dto.ListPromotionQueries {
	p, err := strconv.Atoi(c.Query("page"))
	if err != nil || p == 0 {
		p = 1
	}

	limit, err := strconv.Atoi(c.Query("limit"))
	if err != nil {
		limit = 20
	}

	listPromotionQueries := dto.ListPromotionQueries{
		Limit: uint64(limit),
		Page:  uint64(p),
	}
	promotionStatus := c.Query("status")

	switch promotionStatus {
	case shared.PromotionStatusAll.String():
		listPromotionQueries.Status = shared.PromotionStatusAll
	case shared.PromotionStatusOngoing.String():
		listPromotionQueries.Status = shared.PromotionStatusOngoing
	case shared.PromotionStatusWillCome.String():
		listPromotionQueries.Status = shared.PromotionStatusWillCome
	case shared.PromotionStatusEnded.String():
		listPromotionQueries.Status = shared.PromotionStatusEnded
	default:
		listPromotionQueries.Status = shared.PromotionStatusAll
	}
	return listPromotionQueries
}
