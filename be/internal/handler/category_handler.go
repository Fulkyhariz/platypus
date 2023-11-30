package handler

import (
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	usecase *usecase.Usecase
}

func NewCategoryHandler(usecase *usecase.Usecase) *CategoryHandler {
	return &CategoryHandler{
		usecase: usecase,
	}
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	var httpErr shared.HTTPError

	ctx := c.Request.Context()

	res, err := h.usecase.CategoryUsecase.ListCategories(ctx)
	if err != nil {
		httpErr = shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res})
}

func (h *CategoryHandler) GetCategoryByID(c *gin.Context) {
	var (
		httpErr shared.HTTPError
		res     any
		err     error
	)
	ctx := c.Request.Context()

	id := c.Param("id")
	id = strings.ToUpper(id)
	if strings.Contains(id, "LV-1") {
		res, err = h.usecase.CategoryUsecase.GetCategoryLv1ByID(ctx, id)
	}
	if strings.Contains(id, "LV-2") {
		res, err = h.usecase.CategoryUsecase.GetCategoryLv2ByID(ctx, id)
	}
	if strings.Contains(id, "LV-3") {
		res, err = h.usecase.CategoryUsecase.GetCategoryLv3ByID(ctx, id)
	}
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httpErr = shared.ErrCategoryNotFound
		} else {
			httpErr = shared.ErrInternalServerError
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: res})
}
