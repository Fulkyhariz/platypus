package handler

import (
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PromotionHandler struct {
	usecase *usecase.Usecase
}

func NewPromotionHandler(usecase *usecase.Usecase) *PromotionHandler {
	return &PromotionHandler{
		usecase: usecase,
	}
}

func (h *PromotionHandler) CreateMerchantPromotion(c *gin.Context) {
	ctx := c.Request.Context()
	var httpError shared.HTTPError
	var req dto.ManagePromotionRequest

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

	if err := c.ShouldBindJSON(&req); err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	createPromotionDTO, err := dto.RequestToManagePromotionDTO(req)
	if err != nil {
		httpError = shared.ErrBadRequest
		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	if err := h.usecase.PromotionUsecase.CreateMerchantPromotion(ctx, user, createPromotionDTO); err != nil {
		switch {
		case errors.Is(err, usecase.ErrInvalidMaxAmount):
			httpError = shared.ErrBadRequest
			httpError.Message = errors.Unwrap(errors.Unwrap(err)).Error()

		case errors.Is(err, usecase.ErrProductNotFound):
			httpError = shared.ErrBadRequest
			httpError.Message = shared.ErrProductNotFound.Message

		case errors.Is(err, usecase.ErrMustSpecifyProduct):
			httpError = shared.ErrBadRequest
			httpError.Message = usecase.ErrMustSpecifyProduct.Error()

		case errors.Is(err, usecase.ErrInvalidAmountForDiscountTypePromo):
			httpError = shared.ErrBadRequest
			httpError.Message = usecase.ErrInvalidAmountForDiscountTypePromo.Error()

		default:
			httpError = shared.ErrInternalServerError
		}

		httpError.InternalError = err
		_ = c.Error(&httpError)
		return
	}

	c.JSON(http.StatusOK, &dto.JSONResponse{Message: "Successfully created promotion"})
}
