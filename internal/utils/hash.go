package utils

import (
	"golang.org/x/crypto/bcrypt"
)

type appHash struct {
}

type AppHash interface{
	CheckPassword(userPassword string, providedPassword string) error
	HashPassword(password string) (string,error)
}

func (h *appHash) CheckPassword(userPassword string, providedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(userPassword), []byte(providedPassword))
	if err != nil {
		return err
	}
	return nil
}

func (h *appHash) HashPassword(password string) (string,error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func NewAppHash() *appHash{
	return &appHash{}
}
