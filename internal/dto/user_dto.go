package dto

import (
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"time"
)

type User struct {
	ID          uint64
	Username    string
	Email       string
	Password    string
	FirstName   string
	LastName    string
	PhoneNumber string
	Gender      string
	DateOfBirth time.Time
	IsSeller    bool
}

type UserInfo struct {
	ID         uint64
	Username   string
	PhoneNumber   string
	Email      string
	IsSeller   bool
	CartId     uint64
	WalletId   *string
	MerchantId *uint64
}

func UserReqToDTO(u RegisterUserRequest) (*User, error) {
	dob, err := time.Parse(shared.DateFormat, u.DateOfBirth)
	if err != nil {
		return nil, err
	}
	user := &User{
		Username:    u.Username,
		Email:       u.Email,
		Password:    u.Password,
		FirstName:   u.FirstName,
		LastName:    u.LastName,
		PhoneNumber: u.PhoneNumber,
		Gender:      u.Gender,
		DateOfBirth: dob,
	}
	return user, nil
}

func UserToDTO(u *model.User) *User {
	return &User{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		Password:    u.Password,
		FirstName:   u.FirstName,
		LastName:    u.LastName,
		PhoneNumber: u.PhoneNumber,
		Gender:      u.Gender,
		DateOfBirth: u.DateOfBirth,
		IsSeller:    u.IsSeller,
	}
}

func (u *User) ToModel() *model.User {
	return &model.User{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		Password:    u.Password,
		FirstName:   u.FirstName,
		LastName:    u.LastName,
		PhoneNumber: u.PhoneNumber,
		Gender:      u.Gender,
		DateOfBirth: u.DateOfBirth,
		IsSeller:    u.IsSeller,
	}
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:          u.ID,
		Username:    u.Username,
		Email:       u.Email,
		FirstName:   u.FirstName,
		LastName:    u.LastName,
		PhoneNumber: u.PhoneNumber,
		Gender:      u.Gender,
		DateOfBirth: u.DateOfBirth,
		IsSeller:    u.IsSeller,
	}
}

type JwtAccount struct {
	ID          uint64
}
