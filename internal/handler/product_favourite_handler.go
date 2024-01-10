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

type ProductFavoriteHandler struct {
	usecase *usecase.Usecase
}

func NewProductFavoriteHandler(usecase *usecase.Usecase) *ProductFavoriteHandler {
	return &ProductFavoriteHandler{
		usecase: usecase,
	}
}

func (h *ProductFavoriteHandler) LikeProduct(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.ProductFavoriteRequest
	var httpError shared.HTTPError
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

	if err := h.usecase.ProductFavoriteUseCase.LikeProduct(ctx, user.ID, req.ProductId); err != nil {
		if errors.Is(err, usecase.ErrProductNotFound) {
			httpError = shared.ErrProductNotFound
		}
		if errors.Is(err, usecase.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully liked product"})
}

func (h *ProductFavoriteHandler) DislikeProduct(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.ProductFavoriteRequest
	var httpError shared.HTTPError
	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("ProductFavouriteHandler/DislikeProduct: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.ProductFavoriteUseCase.DislikeProduct(ctx, user.ID, req.ProductId); err != nil {
		if errors.Is(err, repo.ErrDislikeProduct) {
			httpError = shared.ErrDislikeProduct
			httpError.InternalError = err
		}
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully disliked product"})
}

func (h *ProductFavoriteHandler) GetProductFavorite(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListTransaction: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	productFavorite, err := h.usecase.ProductFavoriteUseCase.GetProductFavorite(ctx, user.ID)
	if err != nil {
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: productFavorite})
}

func (h *ProductFavoriteHandler) IsFavorite(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	query := c.Param("id")
	id, err := strconv.Atoi(query)
	if err != nil {
		httpError = shared.ErrConvertToInteger
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("ProductFavouriteHandler/IsFavorite: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	productFavorite, err := h.usecase.ProductFavoriteUseCase.IsFavorite(ctx, user.ID, uint64(id))
	if err != nil {
		if errors.Is(err, usecase.ErrProductNotFound) {
			httpError = shared.ErrProductNotFound
			httpError.InternalError = err
		}
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: productFavorite})
}
