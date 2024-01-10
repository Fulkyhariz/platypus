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

type OrderHandler struct {
	usecase *usecase.Usecase
}

func NewOrderHandler(usecase *usecase.Usecase) *OrderHandler {
	return &OrderHandler{
		usecase: usecase,
	}
}

func (h *OrderHandler) GetOrders(c *gin.Context) {
	var httpErr shared.HTTPError
	ctx := c.Request.Context()

	status := c.DefaultQuery("status", "")
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListTransaction: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	page := c.DefaultQuery("page", "1")
	pageNumber, err := strconv.Atoi(page)
	if err != nil {
		httpErr := shared.ErrConvertToInteger
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListTransaction: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	req := dto.ListTransactionRequest{Status: status, Page: uint64(pageNumber)}
	res, err := h.usecase.OrderUsecase.GetListTransaction(ctx, req, user.CartId, user.ID)
	if err != nil {
		if errors.Is(err, usecase.ErrListTransactionNotFound) {
			httpErr = shared.ErrListTransactionNotFound
		}
		if errors.Is(err, usecase.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	pagination, err := h.usecase.OrderUsecase.GetPaginationListTransaction(ctx, req, user.CartId)
	if err != nil {
		httpErr = shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: res, Meta: &dto.Meta{PaginationInfo: *pagination}})
}

func (h *OrderHandler) GetOrderDetail(c *gin.Context) {
	var httpErr shared.HTTPError
	ctx := c.Request.Context()
	query := c.Param("id")
	id, err := strconv.Atoi(query)
	if err != nil {
		httpErr = shared.ErrPageNotFound
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListTransaction: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	res, err := h.usecase.OrderUsecase.GetOrderDetail(ctx, uint64(id), user.CartId)
	if err != nil {
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		if errors.Is(err, usecase.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		if errors.Is(err, shared.ErrOrderNotFound) {
			httpErr = shared.ErrOrderNotFound
		}
		if errors.Is(err, repo.ErrOrderNotFound) {
			httpErr = shared.ErrOrderNotFound
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{Data: res})
}

func (h *OrderHandler) GetListSellerOrder(c *gin.Context) {
	var httpErr shared.HTTPError
	ctx := c.Request.Context()

	status := c.DefaultQuery("status", "")
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListSellerOrder: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	page := c.DefaultQuery("page", "1")
	pageNumber, err := strconv.Atoi(page)
	if err != nil {
		httpErr := shared.ErrConvertToInteger
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListSellerOrder: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	req := dto.ListSellerTransactionRequest{Status: status, Page: uint64(pageNumber)}
	if user.MerchantId == nil {
		httpErr = shared.ErrUnauthorizedAccess
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	res, err := h.usecase.OrderUsecase.GetListSellerOrder(ctx, req, *user.MerchantId)
	if err != nil {
		if errors.Is(err, usecase.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	pagination, err := h.usecase.OrderUsecase.GetPaginationListSellerOrder(ctx, req, *user.MerchantId)
	if err != nil {
		httpErr = shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res, Meta: &dto.Meta{PaginationInfo: *pagination}})
}

func (h *OrderHandler) GetDetailSellerOrder(c *gin.Context) {
	var httpErr shared.HTTPError
	ctx := c.Request.Context()
	query := c.Param("id")
	id, err := strconv.Atoi(query)
	if err != nil {
		httpErr = shared.ErrPageNotFound
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/GetListTransaction: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if user.MerchantId == nil {
		httpErr = shared.ErrUnauthorizedAccess
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	res, err := h.usecase.OrderUsecase.GetSellerOrderDetail(ctx, uint64(id), *user.MerchantId)
	if err != nil {
		if errors.Is(err, usecase.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		if errors.Is(err, repo.ErrInternalServerError) {
			httpErr = shared.ErrInternalServerError
		}
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		if errors.Is(err, usecase.ErrOrderNotFound) {
			httpErr = shared.ErrOrderNotFound
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res})

}

func (h *OrderHandler) ChangeOrderStatusToProcessed(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()
	var req dto.ChangeStatusOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpErr = shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/ChangeOrderStatusToProcessed: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if user.MerchantId == nil {
		httpErr = shared.ErrUnauthorizedAccess
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.OrderUsecase.ChangeOrderStatusToProcessed(ctx, req.OrderDetailId, *user.MerchantId); err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "success update order status"})
}

func (h *OrderHandler) ChangeOrderStatusToOnDelivery(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()
	var req dto.ChangeStatusOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpErr = shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/ChangeOrderStatusToOnDelivery: %w", err)
		_ = c.Error(&httpErr)
		return
	}

	if user.MerchantId == nil {
		httpErr = shared.ErrUnauthorizedAccess
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.OrderUsecase.ChangeOrderStatusToOnDelivery(ctx, req.OrderDetailId, *user.MerchantId); err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "success update order status"})
}

func (h *OrderHandler) ChangeOrderStatusToDelivered(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()
	var req dto.ChangeStatusOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpErr = shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.OrderUsecase.ChangeOrderStatusToDelivered(ctx, req.OrderDetailId); err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "success update order status"})
}

func (h *OrderHandler) ChangeOrderStatusToCompleted(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()
	var req dto.ChangeStatusOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpErr = shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/ChangeOrderStatusToOnDelivery: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.OrderUsecase.ChangeOrderStatusToCompleted(ctx, req.OrderDetailId, user.CartId); err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "success update order status"})
}

func (h *OrderHandler) ChangeOrderStatusToReviewed(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()
	var req dto.ChangeStatusOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		httpErr = shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("OrderHandler/ChangeOrderStatusToOnDelivery: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	if err := h.usecase.OrderUsecase.ChangeOrderStatusToReviewed(ctx, req.OrderDetailId, user.CartId); err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrUnauthorizedAccess) {
			httpErr = shared.ErrUnauthorizedAccess
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Message: "success update order status"})
}
