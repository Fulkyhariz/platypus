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

	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	usecase *usecase.Usecase
}

func NewCartHandler(usecase *usecase.Usecase) *CartHandler {
	return &CartHandler{
		usecase: usecase,
	}
}

func (h *CartHandler) GetCartDetailHandler(c *gin.Context) {
	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("CartHandler/AddProductToCart: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	cartDetail, err := h.usecase.CartUsecase.GetCartDetail(ctx, user)
	if err != nil {
		httpError := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrVariantNotFound) {
			httpError = shared.ErrVariantNotFound
		}
		httpError.InternalError = err
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: cartDetail})
}

func (h *CartHandler) AddProductToCart(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.AddProductToCartRequest
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
		httpErr.InternalError = fmt.Errorf("CartHandler/AddProductToCart: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	if err := h.usecase.CartUsecase.AddProductToCart(ctx, req, user.CartId); err != nil {
		if errors.Is(err, usecase.ErrVariantNotFound) {
			httpError = shared.ErrVariantNotFound
		}
		if errors.Is(err, usecase.ErrProductVariantStock) {
			httpError = shared.ErrProductVariantStock
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully add product to cart"})
}

func (h *CartHandler) DeleteProductFromCart(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.DeleteProductFromCartRequest
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
		httpErr.InternalError = fmt.Errorf("CartHandler/DeleteProductFromCart: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.CartUsecase.DeleteProductFromCart(ctx, req, user.CartId); err != nil {

		if errors.Is(err, repo.ErrCartProductNotFound) {
			httpError = shared.ErrCartProductNotFound
		}
		if errors.Is(err, repo.ErrUnauthorizedAccess) {
			httpError = shared.ErrUnauthorizedAccess
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully delete product from cart"})
}

func (h *CartHandler) AddQuantityToCart(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.AddQuantityToCartRequest
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
		httpErr.InternalError = fmt.Errorf("CartHandler/AddQuantityToCart: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.CartUsecase.AddQuantityInCart(ctx, req, user.ID); err != nil {
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpError = shared.ErrUnauthorizedAccess
		}
		if errors.Is(err, repo.ErrCartProductNotFound) {
			httpError = shared.ErrCartProductNotFound
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully increase product quantity from cart"})
}

func (h *CartHandler) DecreaseQuantityToCart(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.DecreasedQuantityToCartRequest
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
		httpErr.InternalError = fmt.Errorf("CartHandler/DecreaseQuantityToCart: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	if err := h.usecase.CartUsecase.DecreasedQuantityToCart(ctx, req, user.ID); err != nil {
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpError = shared.ErrUnauthorizedAccess
		}
		if errors.Is(err, usecase.ErrDecreasedStock) {
			httpError = shared.ErrDecreasedStock
		}
		if errors.Is(err, repo.ErrCartProductNotFound) {
			httpError = shared.ErrCartProductNotFound
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully decreased product quantity from cart"})
}

func (h *CartHandler) SetQuantityToCart(c *gin.Context) {
	ctx := c.Request.Context()
	var req dto.DecreasedQuantityToCartRequest
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
		httpErr.InternalError = fmt.Errorf("CartHandler/SetQuantityToCart: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	if err := h.usecase.CartUsecase.SetQuantityToCart(ctx, req, user.ID); err != nil {
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpError = shared.ErrUnauthorizedAccess
		}
		if errors.Is(err, usecase.ErrDecreasedStock) {
			httpError = shared.ErrDecreasedStock
		}
		if errors.Is(err, repo.ErrCartProductNotFound) {
			httpError = shared.ErrCartProductNotFound
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpError = shared.ErrInternalServerError
		}
		if errors.Is(err, usecase.ErrProductVariantStock) {
			httpError = shared.ErrProductVariantStock
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Message: "successfully set product quantity from cart"})
}
