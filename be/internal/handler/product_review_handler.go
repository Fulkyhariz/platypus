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

	"github.com/gin-gonic/gin"
)

type ProductReviewHandler struct {
	usecase *usecase.Usecase
}

func NewProductReviewHandler(usecase *usecase.Usecase) *ProductReviewHandler {
	return &ProductReviewHandler{
		usecase: usecase,
	}
}

func (h *ProductReviewHandler) GetProductReview(c *gin.Context) {
	var httpError shared.HTTPError
	ctx := c.Request.Context()
	query := c.Param("id")
	id, err := strconv.Atoi(query)
	if err != nil {
		httpError = shared.ErrConvertToInteger
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	rating, err := strconv.Atoi(c.DefaultQuery("rating", "0"))
	if err != nil {
		httpError = shared.ErrConvertToInteger
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil {
		httpError = shared.ErrConvertToInteger
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "6"))
	if err != nil {
		httpError = shared.ErrConvertToInteger
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	comment := c.DefaultQuery("comment", "")
	images := c.DefaultQuery("images", "")
	order := c.DefaultQuery("sort", "desc")
	if order == "oldest" {
		order = "asc"
	} else {
		order = "desc"
	}

	req := dto.GetProductReviewRequest{
		ProductId: uint64(id),
		Rating:    uint64(rating),
		Page:      page,
		Order:     order,
		Limit:     limit,
		Images:    images,
		Comments:  comment,
	}
	res, err := h.usecase.ProductReviewUsecase.GetProductReview(ctx, req)

	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	pagination, err := h.usecase.ProductReviewUsecase.GetPaginationProductReview(ctx, req)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	pagination.CurrentPage = int64(page)

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res, Meta: &dto.Meta{PaginationInfo: pagination}})
}

func (h *ProductReviewHandler) CreateProductReview(c *gin.Context) {
	var httpError shared.HTTPError
	ctx := c.Request.Context()
	var req dto.CreateProductReviewRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("ProductFavouriteHandler/LikeProduct: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = h.usecase.ProductReviewUsecase.CreateProductReview(ctx, req, user.ID)
	if err != nil {
		if errors.Is(err, usecase.ErrProductNotFound) {
			httpError = shared.ErrProductNotFound

		}
		if errors.Is(err, usecase.ErrRatingNotValid) {
			httpError = shared.ErrRatingNotValid
		}
		if errors.Is(err, usecase.ErrOrderDetailStatus) {
			httpError = shared.ErrOrderDetailStatus
		}
		if errors.Is(err, usecase.ErrProductReviewed) {
			httpError = shared.ErrProductReviewed
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "sucessfully created product review"})

}

func (h *ProductReviewHandler) IsReviewed(c *gin.Context) {
	var httpError shared.HTTPError
	ctx := c.Request.Context()
	var req dto.IsReviewRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("ProductFavouriteHandler/LikeProduct: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	valid, err := h.usecase.ProductReviewUsecase.IsProductReviewed(ctx, req, user.ID)
	if err != nil {
		if errors.Is(err, usecase.ErrProductNotFound) {
			httpError = shared.ErrProductNotFound
		}
		if errors.Is(err, repo.ErrOrderDetailNotFound) {
			httpError = shared.ErrOrderDetailNotFound
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: dto.IsReviewResponse{IsReview: valid}})
}
