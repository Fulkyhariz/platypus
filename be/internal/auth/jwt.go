package auth

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/shared"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

type JWTClaim struct {
	User dto.JwtAccount `json:"user"`
	jwt.RegisteredClaims
}

type JWT interface {
	GenerateJWT(user dto.JwtAccount) (map[string]string, error)
	GenerateStepUpJWT(user dto.JwtAccount) (string, error)

	ValidateRefreshToken(signedToken string) (*JWTClaim, error)
	ValidateStepUpToken(signedToken string) (*JWTClaim, error)
	ValidateAccessToken(signedToken string) (*JWTClaim, error)

	IsBlacklisted(ctx context.Context, id uint64, token string) bool
}

func GenerateJWT(user dto.JwtAccount) (map[string]string, error) {
	var jwtAccessKey = []byte(os.Getenv("JWT_ACCESS_KEY"))
	var jwtRefreshKey = []byte(os.Getenv("JWT_REFRESH_KEY"))
	token := make(map[string]string)

	accessClaims := JWTClaim{
		User: user,
	}
	accKeyExpireIn, err := strconv.Atoi(os.Getenv("JWT_ACCESS_KEY_TIMER"))
	if err != nil {
		return map[string]string{}, err
	}
	accessClaims.Issuer = os.Getenv("APPLICATION_NAME")
	accessClaims.IssuedAt = jwt.NewNumericDate(time.Now())
	accessClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(accKeyExpireIn) * time.Minute))

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtAccessKey)

	if err != nil {
		return map[string]string{}, err
	}

	token["access"] = accessTokenString

	refreshClaims := JWTClaim{
		User: user,
	}
	refreshKeyExpireIn, err := strconv.Atoi(os.Getenv("JWT_REFRESH_KEY_TIMER"))
	if err != nil {
		return map[string]string{}, err
	}
	refreshClaims.Issuer = os.Getenv("APPLICATION_NAME")
	refreshClaims.IssuedAt = jwt.NewNumericDate(time.Now())
	refreshClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(refreshKeyExpireIn) * 24 * time.Hour))

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtRefreshKey)

	if err != nil {
		return map[string]string{}, err
	}

	token["refresh"] = refreshTokenString

	return token, nil
}

func GenerateStepUpJWT(user dto.JwtAccount) (string, error) {
	var jwtStepUpKey = []byte(os.Getenv("JWT_STEP_UP_KEY"))
	stepUpClaims := JWTClaim{
		User: user,
	}
	stepUpKeyExpireIn, err := strconv.Atoi(os.Getenv("JWT_STEP_UP_KEY_TIMER"))
	if err != nil {
		return "", err
	}
	stepUpClaims.Issuer = os.Getenv("APPLICATION_NAME")
	stepUpClaims.IssuedAt = jwt.NewNumericDate(time.Now())
	stepUpClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(stepUpKeyExpireIn) * time.Minute))

	stepUpToken := jwt.NewWithClaims(jwt.SigningMethodHS256, stepUpClaims)
	stepUpTokenString, err := stepUpToken.SignedString(jwtStepUpKey)

	if err != nil {
		return "", err
	}

	return stepUpTokenString, nil
}

func GenerateForgotPasswordJWT(user dto.JwtAccount) (string, error) {
	var jwtForgotPasswordKey = []byte(os.Getenv("JWT_FORGOT_PASSWORD_KEY"))
	stepUpClaims := JWTClaim{
		User: user,
	}
	stepUpKeyExpireIn, err := strconv.Atoi(os.Getenv("JWT_FORGOT_PASSWORD_KEY_TIMER"))
	if err != nil {
		return "", err
	}
	stepUpClaims.Issuer = os.Getenv("APPLICATION_NAME")
	stepUpClaims.IssuedAt = jwt.NewNumericDate(time.Now())
	stepUpClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(stepUpKeyExpireIn) * time.Minute))

	stepUpToken := jwt.NewWithClaims(jwt.SigningMethodHS256, stepUpClaims)
	stepUpTokenString, err := stepUpToken.SignedString(jwtForgotPasswordKey)

	if err != nil {
		return "", err
	}

	return stepUpTokenString, nil
}

func GenerateChangePasswordJWT(user dto.JwtAccount) (string, error) {
	var jwtChangePasswordKey = []byte(os.Getenv("JWT_CHANGE_PASSWORD_KEY"))
	stepUpClaims := JWTClaim{
		User: user,
	}
	stepUpKeyExpireIn, err := strconv.Atoi(os.Getenv("JWT_CHANGE_PASSWORD_KEY_TIMER"))
	if err != nil {
		return "", err
	}
	stepUpClaims.Issuer = os.Getenv("APPLICATION_NAME")
	stepUpClaims.IssuedAt = jwt.NewNumericDate(time.Now())
	stepUpClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(stepUpKeyExpireIn) * time.Minute))

	stepUpToken := jwt.NewWithClaims(jwt.SigningMethodHS256, stepUpClaims)
	stepUpTokenString, err := stepUpToken.SignedString(jwtChangePasswordKey)

	if err != nil {
		return "", err
	}

	return stepUpTokenString, nil
}

func GenerateChangePinJWT(user dto.JwtAccount) (string, error) {
	var jwtChangePinKey = []byte(os.Getenv("JWT_CHANGE_PIN_KEY"))
	stepUpClaims := JWTClaim{
		User: user,
	}
	stepUpKeyExpireIn, err := strconv.Atoi(os.Getenv("JWT_CHANGE_PIN_KEY_TIMER"))
	if err != nil {
		return "", err
	}
	stepUpClaims.Issuer = os.Getenv("APPLICATION_NAME")
	stepUpClaims.IssuedAt = jwt.NewNumericDate(time.Now())
	stepUpClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(time.Duration(stepUpKeyExpireIn) * time.Minute))

	stepUpToken := jwt.NewWithClaims(jwt.SigningMethodHS256, stepUpClaims)
	stepUpTokenString, err := stepUpToken.SignedString(jwtChangePinKey)

	if err != nil {
		return "", err
	}

	return stepUpTokenString, nil
}

func ValidateAccessToken(signedToken string) (*JWTClaim, error) {
	var jwtAccessKey = []byte(os.Getenv("JWT_ACCESS_KEY"))
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, shared.ErrInvalidSigningMethod
			} else if method != jwt.SigningMethodHS256 {
				return nil, shared.ErrInvalidSigningMethod
			}
			return jwtAccessKey, nil
		},
	)
	if err != nil {
		return nil, shared.ErrInvalidJWTToken
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, shared.ErrParseClaims
	}

	if IsBlacklisted(claims.User.ID, signedToken) {
		return nil, shared.ErrAlreadyLoggedOut
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, shared.ErrInvalidJWTToken
	}
	return claims, nil
}

func ValidateStepUpToken(signedToken string) (*JWTClaim, error) {
	var jwtStepUpKey = []byte(os.Getenv("JWT_STEP_UP_KEY"))

	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, shared.ErrInvalidSigningMethod
			} else if method != jwt.SigningMethodHS256 {
				return nil, shared.ErrInvalidSigningMethod
			}
			return jwtStepUpKey, nil
		},
	)

	if err != nil {
		return nil, shared.ErrInvalidJWTToken
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, shared.ErrParseClaims
	}

	if IsBlacklisted(claims.User.ID, signedToken) {
		return nil, shared.ErrAlreadyLoggedOut
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, shared.ErrInvalidJWTToken
	}
	return claims, nil
}

func ValidateChangePinToken(signedToken string) (*JWTClaim, error) {
	var jwtChangePinKey = []byte(os.Getenv("JWT_CHANGE_PIN_KEY"))

	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, shared.ErrInvalidSigningMethod
			} else if method != jwt.SigningMethodHS256 {
				return nil, shared.ErrInvalidSigningMethod
			}
			return jwtChangePinKey, nil
		},
	)

	if err != nil {
		return nil, shared.ErrInvalidJWTToken
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, shared.ErrParseClaims
	}

	if IsBlacklisted(claims.User.ID, signedToken) {
		return nil, shared.ErrAlreadyLoggedOut
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, shared.ErrInvalidJWTToken
	}
	return claims, nil
}

func ValidateChangePassowrdToken(signedToken string) (*JWTClaim, error) {
	var jwtChangePasswordKey = []byte(os.Getenv("JWT_CHANGE_PASSWORD_KEY"))

	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, shared.ErrInvalidSigningMethod
			} else if method != jwt.SigningMethodHS256 {
				return nil, shared.ErrInvalidSigningMethod
			}
			return jwtChangePasswordKey, nil
		},
	)

	if err != nil {
		return nil, shared.ErrInvalidJWTToken
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, shared.ErrParseClaims
	}

	if IsBlacklisted(claims.User.ID, signedToken) {
		return nil, shared.ErrAlreadyLoggedOut
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, shared.ErrInvalidJWTToken
	}
	return claims, nil
}

func ValidateForgotPasswordToken(signedToken string) (*JWTClaim, error) {
	var jwtForgotPasswordKey = []byte(os.Getenv("JWT_FORGOT_PASSWORD_KEY"))

	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, shared.ErrInvalidSigningMethod
			} else if method != jwt.SigningMethodHS256 {
				return nil, shared.ErrInvalidSigningMethod
			}
			return jwtForgotPasswordKey, nil
		},
	)

	if err != nil {
		return nil, shared.ErrInvalidJWTToken
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, shared.ErrParseClaims
	}

	if IsBlacklisted(claims.User.ID, signedToken) {
		return nil, shared.ErrAlreadyLoggedOut
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, shared.ErrInvalidJWTToken
	}
	return claims, nil
}

func ValidateRefreshToken(signedToken string) (*JWTClaim, error) {
	var jwtRefreshKey = []byte(os.Getenv("JWT_REFRESH_KEY"))
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if method, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, shared.ErrInvalidSigningMethod
			} else if method != jwt.SigningMethodHS256 {
				return nil, shared.ErrInvalidSigningMethod
			}
			return jwtRefreshKey, nil
		},
	)

	if err != nil {
		return nil, shared.ErrInvalidJWTToken
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		return nil, shared.ErrParseClaims
	}

	if IsBlacklisted(claims.User.ID, signedToken) {
		return nil, shared.ErrAlreadyLoggedOut
	}

	if claims.ExpiresAt.Before(time.Now()) {
		return nil, shared.ErrInvalidJWTToken
	}
	return claims, nil
}

func IsBlacklisted(id uint64, token string) bool {
	ctx := context.Background()
	client := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	value, err := client.Get(ctx, fmt.Sprint(id)).Result()
	if err != nil {
		return false
	}
	if value == token {
		return true
	}
	return false
}
