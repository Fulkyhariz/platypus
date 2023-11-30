package handler

import (
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AddressHandler struct {
	usecase *usecase.Usecase
}

func (a *AddressHandler) DeleteAddressHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var address dto.DeleteAddressRequest
	err := c.BindJSON(&address)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	err = a.usecase.AddressUsecase.DeleteAddress(ctx, uint64(address.AddressId))
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "Succesfully set address as default"})
}

func (a *AddressHandler) SetMerchantDefaultHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("AddressHandler/AddAddressHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	var address dto.SetDefaultAddressRequest
	err = c.BindJSON(&address)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	err = a.usecase.AddressUsecase.SetDefault(ctx, address.AddressId, user.ID, shared.Merchant)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "Succesfully set address as default"})
}

func (a *AddressHandler) SetUserDefaultHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("AddressHandler/SetUserDefaultHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	var address dto.SetDefaultAddressRequest
	err = c.BindJSON(&address)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	err = a.usecase.AddressUsecase.SetDefault(ctx, address.AddressId, user.ID, shared.User)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "Succesfully set address as default"})
}

func (a *AddressHandler) UpdateAddressHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("AddressHandler/UpdateAddressHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	var address dto.EditAddressRequest
	err = c.BindJSON(&address)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	addressRes, err := a.usecase.AddressUsecase.EditAddress(ctx, user.ID, &address)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Data:    addressRes,
		Message: "Succesfully update address"})
}

func (a *AddressHandler) FindAllAddressHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("AddressHandler/FindAllAddressHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	addressRes, err := a.usecase.AddressUsecase.GetAllAddresses(ctx, user.ID)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Data:    addressRes})
}

func (a *AddressHandler) AddAddressHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("AddressHandler/AddAddressHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	var address dto.AddAddressRequest
	err = c.BindJSON(&address)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	addressRes, err := a.usecase.AddressUsecase.AddAddress(ctx, user.ID, &address)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Data:    addressRes,
		Message: "Succesfully add address"})
}

func NewAddressHandler(usecase *usecase.Usecase) *AddressHandler {
	return &AddressHandler{
		usecase: usecase,
	}
}
