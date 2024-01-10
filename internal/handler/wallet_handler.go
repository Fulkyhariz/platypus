package handler

import (
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

type WalletHandler struct {
	usecase *usecase.Usecase
}

func NewWalletHandler(usecase *usecase.Usecase) *WalletHandler {
	return &WalletHandler{
		usecase: usecase,
	}
}

func (w *WalletHandler) WalletHistoryHandler(c *gin.Context) {
	ctx := c.Request.Context()

	pageString := c.Query("page")

	page, err := strconv.Atoi(pageString)
	if err != nil {
		page = 1
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/RegisterWalletHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	resData, resMetaPageInfo, err := w.usecase.WalletUsecase.GetHistoryWallet(ctx, user, uint64(page))
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{Data: resData, Meta: &dto.Meta{PaginationInfo: resMetaPageInfo}})
}

func (w *WalletHandler) AuthenticateWalletHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var walletReq dto.CreateWalletRequest

	err := c.BindJSON(&walletReq)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/RegisterWalletHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	_, token, err := w.usecase.WalletUsecase.AuthenticateWallet(ctx, user, walletReq.Pin)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrWalletNotFound) {
			httpErr = shared.ErrWalletNotFound
		}
		if errors.Is(err, usecase.ErrWalletBlocked) {
			httpErr = shared.ErrWalletBlocked
		}
		if errors.Is(err, usecase.ErrWrongPin) {
			httpErr = shared.ErrWrongPin
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Data:    token,
		Message: "wallet authenticated"})
}

func (w *WalletHandler) TopUpWalletHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var topUp dto.TopUpRequest
	err := c.BindJSON(&topUp)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/TopUpWalletHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}
	balance := decimal.NewFromInt(int64(topUp.Amount))
	err = w.usecase.WalletUsecase.TopUpWallet(ctx, user, balance)
	if err != nil {
		httpErr := shared.ErrTopUpFailed
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "top up successful"})
}

func (w *WalletHandler) BlockWalletHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/BlockWalletHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	until, err := w.usecase.WalletUsecase.BlockWallet(ctx, user.ID)
	if err != nil {
		httpErr := shared.ErrWalletNotFound
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{
		Data: dto.BlockWalletResponse{
			ExpiredAt: until,
		},
		Message: "wallet blocked"})
}

func (w *WalletHandler) ChangePinHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var newPin dto.ChangePinRequest
	err := c.BindJSON(&newPin)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/ChangePinHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = w.usecase.WalletUsecase.ChangePin(ctx, user.ID, newPin.Pin)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrPinIsSame) {
			httpErr = shared.ErrPinIsSame
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "pin successfully changed"})

}

func (w *WalletHandler) ValidateChangePinHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var changePinReq dto.ValidateChangePinRequest

	err := c.BindJSON(&changePinReq)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/ValidateChangePinHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	token, err := w.usecase.WalletUsecase.ValidateChangePin(ctx, user.Username, changePinReq.Password)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrWrongCredential) {
			httpErr = shared.ErrWrongCredential
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Data: token})
}

func (w *WalletHandler) RegisterWalletHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var walletReq dto.CreateWalletRequest

	err := c.BindJSON(&walletReq)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/RegisterWalletHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	_, err = w.usecase.WalletUsecase.RegisterWallet(ctx, walletReq.Pin, user.ID)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrWalletAlreadyCreated) {
			httpErr = shared.ErrWalletAlreadyCreated
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "wallet created"})
}

func (u *WalletHandler) WalletDetailsHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("WalletHandler/WalletDetailsHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	waleltDetails, err := u.usecase.WalletUsecase.GetDetails(ctx, user.ID)
	if err != nil {
		httpErr := shared.ErrWalletNotFound
		if errors.Is(err, usecase.ErrWalletBlocked) {
			httpErr = shared.ErrWalletBlocked
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{
		Data: waleltDetails})
}
