package handler

import (
	"digital-test-vm/be/internal/auth"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"digital-test-vm/be/internal/usecase"
	"digital-test-vm/be/internal/utils"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	usecase *usecase.Usecase
}

func (u *UserHandler) ChangeProfilePictureHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var profilePicture dto.ChangePhotoProfileRequest
	err := c.BindJSON(&profilePicture)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/ChangePasswordHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = u.usecase.UserUsecase.UpdateProfilePicture(ctx, profilePicture.PhotoProfile, user.Username)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{
		Message: "change photo profile successfull",
	})
}

func (u *UserHandler) ChangeEmailHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var email dto.ChangeEmailRequest
	err := c.BindJSON(&email)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/ChangePasswordHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = u.usecase.UserUsecase.UpdateEmail(ctx, email.Email, user.Username)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{
		Message: "change email successful",
	})
}

func (u *UserHandler) ForgotPasswordHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var email dto.ForgotPasswordRequest
	err := c.BindJSON(&email)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	err = u.usecase.UserUsecase.VerifyForgotPassword(ctx, email.Email)
	if err != nil {
		httpErr := shared.ErrCodeIsNotValid
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{})
}

func (u *UserHandler) ChangePasswordHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var newPass dto.ChangePasswordRequest
	err := c.BindJSON(&newPass)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/ChangePasswordHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = utils.ValidatePassword(newPass.NewPassword)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.Message = err.Error()
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	err = u.usecase.UserUsecase.ChangePassword(ctx, user, newPass.NewPassword)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrPasswordIsSame) {
			httpErr = shared.ErrPasswordIsSame
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "password successfully changed"})
}

func (u *UserHandler) PasswordVerificationCodeHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var code dto.VerifyPasswordCodeRequest
	err := c.BindJSON(&code)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/PasswordVerificationCodeHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	token, err := u.usecase.UserUsecase.VerifyPasswordCode(ctx, user, code.Code)
	if err != nil {
		httpErr := shared.ErrCodeIsNotValid
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{
		Data:    token,
		Message: "code verified"})
}

func (u *UserHandler) SendPasswordVerificationCodeHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/SendPasswordVerificationCodeHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err = u.usecase.UserUsecase.SendPasswordVerificationCode(ctx, user)
	if err != nil {
		httpErr := shared.ErrGenerateVerificationCodeFailed
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	c.JSON(http.StatusOK, dto.JSONResponse{
		Message: "verification code is sent to email"})
}

func (u *UserHandler) UserDetailHandler(c *gin.Context) {

	ctx := c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/UserDetailHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	userDetails, err := u.usecase.UserUsecase.GetDetails(ctx, user.Username)
	if err != nil {
		httpErr := shared.ErrUserNotFound
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusOK, dto.JSONResponse{
		Data: userDetails})
}

func (u *UserHandler) RefreshTokenHandler(c *gin.Context) {

	ctx := c.Request.Context()

	header := c.GetHeader("Authorization")
	splittedHeader := strings.Split(header, " ")
	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/RefreshTokenHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	tokenMap, err := u.usecase.UserUsecase.GetToken(ctx, *user)
	if err != nil {
		httpErr := shared.ErrGenerateTokenFailed
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	tokenMap["refresh"] = splittedHeader[1]
	tokenResponse := dto.ToTokenResponse(tokenMap)
	c.JSON(http.StatusOK, dto.JSONResponse{
		Data: tokenResponse})
}

func (u *UserHandler) LogOutHandler(c *gin.Context) {

	ctx := c.Request.Context()

	header := c.GetHeader("Authorization")
	splittedHeader := strings.Split(header, " ")
	claims, ok := c.Get("claims")
	if !ok {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/LogOutHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	err := u.usecase.UserUsecase.LogOutUser(ctx, claims.(*auth.JWTClaim), splittedHeader[1])
	if err != nil {
		httpErr := shared.ErrAlreadyLoggedOut
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "Succesfully logout"})
}

func (u *UserHandler) RegisterMerchantHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var merchantName dto.RegisterMerchantRequest

	err := c.BindJSON(&merchantName)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		httpErr := shared.ErrClaimsNotFound
		httpErr.InternalError = fmt.Errorf("UserHandler/RegisterMerchantHandler: %w", shared.ErrClaimsNotFound)
		_ = c.Error(&httpErr)
		return
	}

	merchant, err := u.usecase.UserUsecase.RegisterMerchant(ctx, user, merchantName)
	
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, repo.ErrNotHaveAddress) {
			httpErr = shared.ErrNotHaveAddress
		}
		if errors.Is(err, usecase.ErrAlreadyHaveMerchant) {
			httpErr = shared.ErrAlreadyHaveMerchant
		}
		if errors.Is(err, usecase.ErrAccountNotFound) {
			httpErr = shared.ErrUserNotFound
		}

		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Data:    merchant,
		Message: "Merchant Registered"})
}

func (u *UserHandler) RegisterUserHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var userReq dto.RegisterUserRequest

	err := c.BindJSON(&userReq)

	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	user, err := dto.UserReqToDTO(userReq)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.Message = err.Error()
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	err = utils.ValidateUsers(*user)
	if err != nil {
		httpErr := shared.ErrBadRequest
		httpErr.Message = err.Error()
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	_, err = u.usecase.UserUsecase.RegisterUser(ctx, user)
	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, repo.ErrAlreadyRegistered) {
			httpErr = shared.ErrAlreadyRegistered
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}

	c.JSON(http.StatusCreated, dto.JSONResponse{
		Message: "User Registered"})
}

func (u *UserHandler) LoginHandler(c *gin.Context) {

	ctx := c.Request.Context()

	var loginReq dto.LoginRequest

	err := c.BindJSON(&loginReq)
	if err != nil {
		return
	}
	user, tokenMap, err := u.usecase.UserUsecase.AuthenticateUser(ctx, &loginReq)

	if err != nil {
		httpErr := shared.ErrInternalServerError
		if errors.Is(err, usecase.ErrWrongCredential){
			httpErr = shared.ErrWrongCredential
		}
		httpErr.InternalError = err
		_ = c.Error(&httpErr)
		return
	}
	tokenResponse := dto.ToTokenResponse(tokenMap)
	tokenResponse.UserData = user
	c.JSON(http.StatusOK, dto.JSONResponse{
		Data: tokenResponse})
}

func NewUserHandler(usecase *usecase.Usecase) *UserHandler {
	return &UserHandler{
		usecase: usecase,
	}
}
