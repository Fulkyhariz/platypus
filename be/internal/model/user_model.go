package model

import "time"

type User struct {
	ID             uint64     `gorm:"column:id"`
	FirstName      string     `gorm:"column:first_name"`
	LastName       string     `gorm:"column:last_name"`
	Username       string     `gorm:"column:username"`
	Email          string     `gorm:"column:email"`
	Password       string     `gorm:"column:password"`
	Gender         string     `gorm:"column:gender"`
	ProfilePicture *string     `gorm:"column:profile_picture"`
	DateOfBirth    time.Time `gorm:"column:date_of_birth"`
	PhoneNumber    string     `gorm:"column:phone_number"`
	IsSeller       bool       `gorm:"column:is_seller"`
	CreatedAt      time.Time  `gorm:"column:created_at"`
	UpdatedAt      time.Time  `gorm:"column:updated_at"`
	DeletedAt      *time.Time `gorm:"column:deleted_at"`
}
