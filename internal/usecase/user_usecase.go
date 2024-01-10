package usecase

import (
	"context"
	"digital-test-vm/be/internal/auth"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	utils "digital-test-vm/be/internal/utils"
	"errors"
	"fmt"
	"os"
	"time"
)


type userUsecase struct {
	repo     *repo.Repo
	hashUtil utils.AppHash
}

type UserUsecase interface {
	RegisterUser(ctx context.Context, userDTO *dto.User) (*dto.User, error)
	AuthenticateUser(ctx context.Context, login *dto.LoginRequest) (*dto.UserResponse,map[string]string, error)
	LogOutUser(ctx context.Context, claims *auth.JWTClaim, token string) error
	GetToken(ctx context.Context, account dto.UserInfo) (map[string]string, error)
	GetDetails(ctx context.Context, username string) (*dto.UserResponse, error)

	UpdateEmail(ctx context.Context, email string, username string) error
	UpdateProfilePicture(ctx context.Context, profilePicture string, username string) error

	SendPasswordVerificationCode(ctx context.Context, user *dto.UserInfo) error
	VerifyPasswordCode(ctx context.Context, user *dto.UserInfo, code string) (string, error)
	ChangePassword(ctx context.Context, user *dto.UserInfo, newPassword string) error
	VerifyForgotPassword(ctx context.Context, email string) error

	RegisterMerchant(ctx context.Context, userDTO *dto.UserInfo, merchant dto.RegisterMerchantRequest) (*dto.MerchantResponse, error)
}

func (u *userUsecase) UpdateProfilePicture(ctx context.Context, profilePicture string, username string) error {
	err := u.repo.UserRepo.UpdateProfilePicture(ctx, username, profilePicture)
	if err != nil {
		if errors.Is(err, repo.ErrUserNotFound) {
			return fmt.Errorf("error userUsecase/UpdateProfilePicture: %w", ErrAccountNotFound)
		}
		return fmt.Errorf("error userUsecase/UpdateProfilePicture: %w", err)
	}
	return nil
}

func (u *userUsecase) UpdateEmail(ctx context.Context, email string, username string) error {
	err := u.repo.UserRepo.UpdateEmail(ctx, username, email)
	if err != nil {
		if errors.Is(err, repo.ErrUserNotFound) {
			return fmt.Errorf("error userUsecase/UpdateEmail: %w", ErrAccountNotFound)
		}
		return fmt.Errorf("error userUsecase/UpdateEmail: %w", err)
	}
	return nil
}

func (u *userUsecase) VerifyForgotPassword(ctx context.Context, email string) error {
	userModel, err := u.repo.UserRepo.FindByEmail(ctx, email)
	if err != nil {
		return fmt.Errorf("userUsecase/VerifyForgotPassword: %w", ErrAccountNotFound)
	}
	jwtAcc := dto.JwtAccount{ID: userModel.ID}
	token, err := auth.GenerateForgotPasswordJWT(jwtAcc)
	if err != nil {
		return fmt.Errorf("userUsecase/VerifyForgotPassword: %w", err)
	}
	go func(email string, tokenz string) error {
		host := os.Getenv("API_HOST")
		err := utils.GenerateAndSendEmail(email, fmt.Sprintf(host+"/forgot-password/%s", tokenz))
		if err != nil {
			return fmt.Errorf("userUsecase/VerifyForgotPassword: %w", err)
		}
		return nil
	}(userModel.Email, token)
	return nil
}

func (u *userUsecase) VerifyPasswordCode(ctx context.Context, user *dto.UserInfo, code string) (string, error) {
	username, err := u.repo.UserRepo.GetVerificationUsername(ctx, code)
	if err != nil {
		return "", fmt.Errorf("userUsecase/VerifyPasswordCode: %w", err)
	}

	if username != user.Username {
		return "", fmt.Errorf("userUsecase/VerifyPasswordCode: %w", err)
	}
	jwtAcc := dto.JwtAccount{ID: user.ID}
	token, err := auth.GenerateChangePasswordJWT(jwtAcc)
	if err != nil {
		return "", fmt.Errorf("error userUsecase/GetToken: %w", err)
	}
	return token, nil
}

func (u *userUsecase) ChangePassword(ctx context.Context, user *dto.UserInfo, newPassword string) error {
	userModel, err := u.repo.UserRepo.FindByUsername(ctx, user.Username)
	if err != nil {
		return fmt.Errorf("userUsecase/ChangePassword: %w", ErrAccountNotFound)
	}
	err = u.hashUtil.CheckPassword(userModel.Password, newPassword)
	if err == nil {
		return fmt.Errorf("userUsecase/ChangePassword: %w", ErrPasswordIsSame)
	}
	newHashedPass, err := u.hashUtil.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("userUsecase/ChangePassword: %w", err)
	}
	err = u.repo.UserRepo.UpdatePassword(ctx, user.Username, newHashedPass)
	if err != nil {
		return fmt.Errorf("userUsecase/ChangePassword: %w", err)
	}
	return nil
}

func (u *userUsecase) SendPasswordVerificationCode(ctx context.Context, user *dto.UserInfo) error {
	_, err := u.repo.UserRepo.FindByUsername(ctx, user.Username)
	if err != nil {
		return fmt.Errorf("userUsecase/SendPasswordVerificationCode: %w", ErrAccountNotFound)
	}
	code := utils.GenerateVerificationCode(6)
	go func(email string, tokenz string) error {
		err := utils.GenerateAndSendEmail(email, fmt.Sprintf("this is your verification code: %s", tokenz))
		if err != nil {
			return fmt.Errorf("userUsecase/VerifyForgotPassword: %w", err)
		}
		return nil
	}(user.Email, code)
	err = u.repo.UserRepo.SetVerificationCode(ctx, user.Username, code)
	if err != nil {
		return fmt.Errorf("userUsecase/SendPasswordVerificationCode: %w", err)
	}
	return nil
}

func (u *userUsecase) LogOutUser(ctx context.Context, claims *auth.JWTClaim, token string) error {
	err := u.repo.UserRepo.BlacklistToken(ctx, claims.ExpiresAt.Time, claims.User.ID, token)
	if err != nil {
		return fmt.Errorf("error userUsecase/LogOutUser: %w", err)
	}
	return nil
}

func (u *userUsecase) GetDetails(ctx context.Context, username string) (*dto.UserResponse, error) {
	userModel, err := u.repo.UserRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, fmt.Errorf("error userUsecase/GetDetails: %w", ErrAccountNotFound)
	}
	userResponse := &dto.UserResponse{
		ID:             userModel.ID,
		FirstName:      userModel.FirstName,
		LastName:       userModel.LastName,
		Username:       userModel.Username,
		Email:          userModel.Email,
		PhoneNumber:    userModel.PhoneNumber,
		IsSeller:       userModel.IsSeller,
		Gender:         userModel.Gender,
		ProfilePicture: userModel.ProfilePicture,
		DateOfBirth:    userModel.DateOfBirth,
	}
	return userResponse, nil
}

func (u *userUsecase) RegisterMerchant(ctx context.Context, userDTO *dto.UserInfo, merchant dto.RegisterMerchantRequest) (*dto.MerchantResponse, error) {
	userModel, err := u.repo.UserRepo.FindByUsername(ctx, userDTO.Username)
	if err != nil {
		return nil, fmt.Errorf("error userUsecase/RegisterMerchant: %w", ErrAccountNotFound)
	}
	_, err = u.repo.MerchantRepo.FindMerchantByUserID(ctx, userModel.ID)
	if err == nil {
		return nil, fmt.Errorf("error userUsecase/RegisterMerchant: %w", ErrAlreadyHaveMerchant)
	}
	merchantModel := &model.Merchant{
		Name:        merchant.MerchantName,
		PhoneNumber: userDTO.PhoneNumber,
		Rating:      0.0,
		OpeningDate: time.Now(),
		UserID:      userDTO.ID,
	}
	user := dto.UserResponse{
		ID:       userModel.ID,
		Email:    userModel.Email,
		Username: userModel.Username,
		IsSeller: userModel.IsSeller,
	}
	merchantModel, err = u.repo.MerchantRepo.CreateMerchant(ctx, merchantModel)
	if err != nil {
		return nil, fmt.Errorf("error userUsecase/LogOutUser: %w", err)
	}
	response := &dto.MerchantResponse{
		ID:          merchantModel.ID,
		Name:        merchantModel.Name,
		PhoneNumber: merchantModel.PhoneNumber,
		Rating:      merchantModel.Rating,
		OpeningDate: merchantModel.OpeningDate,
		UserID:      merchantModel.UserID,
		User:        &user,
	}
	return response, nil
}

func (u *userUsecase) RegisterUser(ctx context.Context, userDTO *dto.User) (*dto.User, error) {
	userModel := userDTO.ToModel()
	hashedPass, err := u.hashUtil.HashPassword(userModel.Password)
	if err != nil {
		return nil, fmt.Errorf("error userUsecase/RegisterUser: %w", err)
	}
	userModel.Password = hashedPass
	userModel, err = u.repo.UserRepo.Create(ctx, userModel)
	if err != nil {
		return nil, fmt.Errorf("error userUsecase/RegisterUser: %w", err)
	}
	userDTO = dto.UserToDTO(userModel)
	return userDTO, nil
}

func (u *userUsecase) AuthenticateUser(ctx context.Context, login *dto.LoginRequest) (*dto.UserResponse,map[string]string, error) {
	userModel, err := u.repo.UserRepo.FindByUsername(ctx, login.Username)
	if err != nil {
		return nil, map[string]string{}, fmt.Errorf("error userUsecase/AuthenticateUser: %w", ErrWrongCredential)
	}
	err = u.hashUtil.CheckPassword(userModel.Password, login.Password)
	if err != nil {
		return nil, map[string]string{}, fmt.Errorf("error userUsecase/AuthenticateUser: %w", ErrWrongCredential)
	}
	token, err := u.GetToken(ctx, dto.UserInfo{
		ID: userModel.ID,
	})
	userResponse := &dto.UserResponse{
		ID:             userModel.ID,
		FirstName:      userModel.FirstName,
		LastName:       userModel.LastName,
		Username:       userModel.Username,
		Email:          userModel.Email,
		PhoneNumber:    userModel.PhoneNumber,
		IsSeller:       userModel.IsSeller,
		Gender:         userModel.Gender,
		ProfilePicture: userModel.ProfilePicture,
		DateOfBirth:    userModel.DateOfBirth,
	}
	if err != nil {
		return nil, map[string]string{}, fmt.Errorf("error userUsecase/AuthenticateUser: %w", err)
	}
	return userResponse,token, nil
}

func (u *userUsecase) GetToken(ctx context.Context, account dto.UserInfo) (map[string]string, error) {
	jwtAcc := dto.JwtAccount{ID: account.ID}
	token, err := auth.GenerateJWT(jwtAcc)
	if err != nil {
		return map[string]string{}, fmt.Errorf("error userUsecase/GetToken: %w", err)
	}
	return token, nil
}

func NewUserUsecase(repo *repo.Repo) UserUsecase {
	return &userUsecase{repo: repo, hashUtil: utils.NewAppHash()}
}
