package utils

import (
	"digital-test-vm/be/internal/dto"
	"errors"
	"regexp"
	"strings"
	"unicode"
)

var ErrUsernameInPassword = errors.New("username should not be in password")
var ErrInvalidPassword = errors.New("pasword should have minimum 8 character with uppercase, lowercase, and number")

func ValidateUsers(u dto.User) error {
	user := regexp.MustCompile(strings.ToLower(u.Username))
	nameExist := user.FindString(strings.ToLower(u.Password))
	if nameExist != "" {
		return ErrUsernameInPassword
	}
	err := ValidatePassword(u.Password)
	if err != nil {
		return err
	}
	return nil
}

func ValidatePassword(pass string) error {
	var (
		hasUpper  = false
		hasLower  = false
		hasNumber = false
	)
	if len(pass) < 8 {
		return ErrInvalidPassword
	}
	for _, char := range pass {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		}
	}
	if !(hasUpper && hasLower && hasNumber) {
		return ErrInvalidPassword
	}
	return nil
}

func CheckValueStringIn(s string, args ...string) bool {
	for _, arg := range args {
		if s == arg {
			return true
		}
	}
	return false
}

func CheckErrorIn(err error, args ...error) bool {
	for _, arg := range args {
		if errors.Is(err, arg) {
			return true
		}
	}
	return false
}
