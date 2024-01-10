package handler

import (
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CheckoutHandler struct {
	usecase *usecase.Usecase
}

func NewCheckoutHandler(usecase *usecase.Usecase) *CheckoutHandler {
	return &CheckoutHandler{
		usecase: usecase,
	}
}

func (h *CheckoutHandler) GetPromoHandler(c *gin.Context) {
	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("CheckoutHandler/GetPromoHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	promo, err := h.usecase.CheckoutUsecase.GetAvailablePromo(ctx, *user)
	if err != nil {
		httpError := shared.ErrInternalServerError
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: promo})
}

func (h *CheckoutHandler) CheckoutCartHandler(c *gin.Context) {
	var checkout dto.CheckoutRequest
	ctx := c.Request.Context()

	err := c.BindJSON(&checkout)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("CheckoutHandler/CheckoutCartHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = h.usecase.CheckoutUsecase.CheckoutCart(ctx, checkout, *user)
	if err != nil {
		httpError := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrInsufficientBalance){
			httpError = shared.ErrInsufficientBalance
		}
		if errors.Is(err, usecase.ErrCartEmpty){
			httpError = shared.ErrCartEmpty
		}
		if errors.Is(err, usecase.ErrInvalidAddress){
			httpError = shared.ErrCartEmpty
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{Message: "checkout success"})
}

func (h *CheckoutHandler) CheckPriceHandler(c *gin.Context) {
	var checkout dto.CheckoutRequest
	ctx := c.Request.Context()

	err := c.BindJSON(&checkout)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("CheckoutHandler/CheckPriceHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	res, err := h.usecase.CheckoutUsecase.CheckPrice(ctx, checkout, *user)
	if err != nil {
		httpError := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrInsufficientBalance){
			httpError = shared.ErrInsufficientBalance
		}
		if errors.Is(err, usecase.ErrCartEmpty){
			httpError = shared.ErrCartEmpty
		}
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{Data: res})
}
