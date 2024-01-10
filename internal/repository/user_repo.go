package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type userRepo struct {
	db    *gorm.DB
	redis *redis.Client
	cart  CartRepo
}

type UserRepo interface {
	Create(ctx context.Context, user *model.User) (*model.User, error)
	FindByUsername(ctx context.Context, username string) (*model.User, error)
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindById(ctx context.Context, id uint64) (*model.User, error)

	FindUserInfo(ctx context.Context, id uint64) (*dto.UserInfo, error)

	UpdatePassword(ctx context.Context, username string, password string) error
	UpdateEmail(ctx context.Context, username string, email string) error
	UpdateProfilePicture(ctx context.Context, username string, profile_picture string) error

	BlacklistToken(ctx context.Context, ttl time.Time, id uint64, token string) error
	SetVerificationCode(ctx context.Context, username string, code string) error
	GetVerificationUsername(ctx context.Context, code string) (string, error)

	FindNameAndPictureById(ctx context.Context, id uint64) (string, string, error)
	FindUsernameById(ctx context.Context, id uint64) (string, error)
}

func NewUserRepo(db *gorm.DB, redis *redis.Client, cart CartRepo) UserRepo {
	return &userRepo{db: db, redis: redis, cart: cart}
}

func (ur *userRepo) FindUserInfo(ctx context.Context, id uint64) (*dto.UserInfo, error) {
	userModel, err := ur.FindById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("userRepo/FindUserInfo: %w", err)
	}
	var cart model.Cart
	var merchant model.Merchant
	var wallet model.Wallet
	var walletId *string
	err = ur.db.WithContext(ctx).Where("user_id = ?", id).First(&cart).Error
	if err != nil {
		return nil, fmt.Errorf("userRepo/FindUserInfo: %w", err)
	}
	err = ur.db.WithContext(ctx).Where("user_id = ?", id).First(&wallet).Error

	if errors.Is(err, gorm.ErrRecordNotFound){
		walletId = nil
		err = nil
	} else {
		walletId = &wallet.WalletId
	}

	if err != nil {
		return nil, fmt.Errorf("userRepo/FindUserInfo: %w", err)
	}
	
	userInfo := &dto.UserInfo{
		ID:          id,
		Username:    userModel.Username,
		PhoneNumber: userModel.PhoneNumber,
		Email: userModel.Username,
		IsSeller: userModel.IsSeller,
		CartId: cart.ID,
		WalletId: walletId,
		MerchantId: nil,
	}
	if userInfo.IsSeller {
		err = ur.db.WithContext(ctx).Where("user_id = ?", id).First(&merchant).Error
		if err != nil {
			return nil, fmt.Errorf("userRepo/FindUserInfo: %w", err)
		}
		userInfo.MerchantId = &merchant.ID
	}
	return userInfo, nil
}

func (ur *userRepo) GetVerificationUsername(ctx context.Context, code string) (string, error) {

	value, err := ur.redis.Get(ctx, code).Result()
	if err != nil {
		return "", fmt.Errorf("userRepo/GetVerificationUsername: %w", err)
	}

	return value, nil
}

func (ur *userRepo) SetVerificationCode(ctx context.Context, username string, code string) error {

	err := ur.redis.Set(ctx, code, username, time.Until(time.Now().Add(1*time.Minute))).Err()
	if err != nil {
		return fmt.Errorf("user_repo/SetVerificationCode: %w", err)
	}

	return nil
}

func (ur *userRepo) UpdateProfilePicture(ctx context.Context, username string, profile_picture string) error {
	var user model.User

	tx := ur.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("username = ?", username).First(&user).Error
	if err != nil {
		return fmt.Errorf("error userRepo/UpdateEmail: %w", ErrUserNotFound)
	}

	user.ProfilePicture = &profile_picture
	user.UpdatedAt = time.Now()

	err = tx.Save(user).Error
	if err != nil {
		return fmt.Errorf("error userRepo/UpdateEmail: %w", err)
	}
	tx.Commit()
	return nil
}

func (ur *userRepo) UpdateEmail(ctx context.Context, username string, email string) error {
	var user model.User

	tx := ur.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("username = ?", username).First(&user).Error
	if err != nil {
		return fmt.Errorf("error userRepo/UpdateEmail: %w", ErrUserNotFound)
	}

	user.Email = email
	user.UpdatedAt = time.Now()

	err = tx.Save(user).Error
	if err != nil {
		return fmt.Errorf("error userRepo/UpdateEmail: %w", err)
	}
	tx.Commit()
	return nil
}

func (ur *userRepo) UpdatePassword(ctx context.Context, username string, password string) error {
	var user model.User

	tx := ur.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("username = ?", username).First(&user).Error

	if err != nil {
		return fmt.Errorf("error userRepo/UpdatePassword: %w", ErrUserNotFound)
	}

	user.Password = password
	user.UpdatedAt = time.Now()

	err = tx.Save(user).Error
	if err != nil {
		return fmt.Errorf("error userRepo/UpdatePassword: %w", err)
	}
	tx.Commit()
	return nil
}

func (ur *userRepo) BlacklistToken(ctx context.Context, ttl time.Time, id uint64, token string) error {
	if ttl.After(time.Now()) {
		err := ur.redis.Set(ctx, fmt.Sprint(id), token, time.Until(ttl)).Err()

		if err != nil {
			return fmt.Errorf("user_repo/BlacklistToken: %w", err)
		}
	}
	return nil
}

func (ur *userRepo) Create(ctx context.Context, user *model.User) (*model.User, error) {
	tx := ur.db.WithContext(ctx).Begin()
	defer tx.Rollback()
	err := tx.Create(user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, fmt.Errorf("error userRepo/Create: %w", ErrAlreadyRegistered)
		}
		return nil, err
	}
	tx, err = ur.cart.CreateCart(ctx, tx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("error userRepo/Create: %w", err)
	}
	tx.Commit()
	return user, nil
}

func (ur *userRepo) FindById(ctx context.Context, id uint64) (*model.User, error) {
	var user model.User
	err := ur.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, fmt.Errorf("userRepo/FindById: %w", err)
	}
	return &user, nil
}

func (ur *userRepo) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := ur.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, fmt.Errorf("userRepo/FindByUsername: %w", err)
	}
	return &user, nil
}

func (ur *userRepo) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := ur.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, fmt.Errorf("error userRepo/FindByEmail: %w", ErrUserNotFound)
	}
	return &user, nil
}

func (ur *userRepo) FindNameAndPictureById(ctx context.Context, id uint64) (string, string, error) {
	var user model.User
	err := ur.db.WithContext(ctx).Table(`users as u`).Select(`u."first_name",u."profile_picture"`).Where(`id=?`, id).First(&user).Error
	if err != nil {
		return "", "", fmt.Errorf("error userRepo/FindNameAndPictureById %w", ErrInternalServerError)
	}
	return user.FirstName, *user.ProfilePicture, nil
}

func (u *userRepo) FindUsernameById(ctx context.Context, id uint64) (string, error) {
	var user model.User
	if err := u.db.WithContext(ctx).Model(&model.User{}).Where("id=?", id).First(&user).Error; err != nil {
		return "", fmt.Errorf("userRepo/FindUsernameById %w", ErrInternalServerError)
	}
	return user.Username, nil
}
