package middleware

import (
	"digital-test-vm/be/internal/auth"
	"digital-test-vm/be/internal/shared"
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("ENV_MODE") == "testing" {
			c.Set("user_id", int64(1))
			c.Next()
			return
		}

		header := c.GetHeader("Authorization")
		splittedHeader := strings.Split(header, " ")
		if len(splittedHeader) != 2 {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		claims, err := auth.ValidateAccessToken(splittedHeader[1])

		if errors.Is(err, shared.ErrParseClaims) {
			c.AbortWithStatusJSON(
				shared.ErrParseClaims.StatusCode, shared.ErrParseClaims.ToErrorDto())
			return
		}

		if errors.Is(err, shared.ErrInvalidJWTToken) {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		if err != nil {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		c.Set("claims", claims)
		c.Set("user", claims.User)

		c.Next()
	}
}

func RefreshTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("ENV_MODE") == "testing" {
			c.Set("user_id", int64(1))
			c.Next()
			return
		}

		header := c.GetHeader("Authorization")
		splittedHeader := strings.Split(header, " ")
		if len(splittedHeader) != 2 {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized, shared.ErrParseClaims.ToErrorDto())
			return
		}

		claims, err := auth.ValidateRefreshToken(splittedHeader[1])

		if errors.Is(err, shared.ErrParseClaims) {
			c.AbortWithStatusJSON(
				shared.ErrParseClaims.StatusCode, shared.ErrParseClaims.ToErrorDto())
			return
		}

		if errors.Is(err, shared.ErrInvalidJWTToken) {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		if err != nil {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		c.Set("claims", claims)
		c.Set("user", claims.User)

		c.Next()
	}
}

func ForgotPasswordTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("ENV_MODE") == "testing" {
			c.Set("user_id", int64(1))
			c.Next()
			return
		}

		header := c.GetHeader("Authorization")
		splittedHeader := strings.Split(header, " ")
		if len(splittedHeader) != 2 {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized, shared.ErrParseClaims.ToErrorDto())
			return
		}

		claims, err := auth.ValidateForgotPasswordToken(splittedHeader[1])

		if errors.Is(err, shared.ErrParseClaims) {
			c.AbortWithStatusJSON(
				shared.ErrParseClaims.StatusCode, shared.ErrParseClaims.ToErrorDto())
			return
		}

		if errors.Is(err, shared.ErrInvalidJWTToken) {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		if err != nil {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		c.Set("claims", claims)
		c.Set("user", claims.User)

		c.Next()
	}
}

func ChangePasswordTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("ENV_MODE") == "testing" {
			c.Set("user_id", int64(1))
			c.Next()
			return
		}

		header := c.GetHeader("Authorization")
		splittedHeader := strings.Split(header, " ")
		if len(splittedHeader) != 2 {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized, shared.ErrParseClaims.ToErrorDto())
			return
		}

		claims, err := auth.ValidateChangePassowrdToken(splittedHeader[1])

		if errors.Is(err, shared.ErrParseClaims) {
			c.AbortWithStatusJSON(
				shared.ErrParseClaims.StatusCode, shared.ErrParseClaims.ToErrorDto())
			return
		}

		if errors.Is(err, shared.ErrInvalidJWTToken) {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		if err != nil {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		c.Set("claims", claims)
		c.Set("user", claims.User)

		c.Next()
	}
}

func ChangePinTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("ENV_MODE") == "testing" {
			c.Set("user_id", int64(1))
			c.Next()
			return
		}

		header := c.GetHeader("Authorization")
		splittedHeader := strings.Split(header, " ")
		if len(splittedHeader) != 2 {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized, shared.ErrParseClaims.ToErrorDto())
			return
		}

		claims, err := auth.ValidateChangePinToken(splittedHeader[1])

		if errors.Is(err, shared.ErrParseClaims) {
			c.AbortWithStatusJSON(
				shared.ErrParseClaims.StatusCode, shared.ErrParseClaims.ToErrorDto())
			return
		}

		if errors.Is(err, shared.ErrInvalidJWTToken) {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		if err != nil {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		c.Set("claims", claims)
		c.Set("user", claims.User)

		c.Next()
	}
}

func StepUpTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("ENV_MODE") == "testing" {
			c.Set("user_id", int64(1))
			c.Next()
			return
		}

		header := c.GetHeader("Authorization")
		splittedHeader := strings.Split(header, " ")
		if len(splittedHeader) != 2 {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized, shared.ErrParseClaims.ToErrorDto())
			return
		}

		claims, err := auth.ValidateStepUpToken(splittedHeader[1])

		if errors.Is(err, shared.ErrParseClaims) {
			c.AbortWithStatusJSON(
				shared.ErrParseClaims.StatusCode, shared.ErrParseClaims.ToErrorDto())
			return
		}

		if errors.Is(err, shared.ErrInvalidJWTToken) {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		if err != nil {
			c.AbortWithStatusJSON(
				shared.ErrInvalidJWTToken.StatusCode, shared.ErrInvalidJWTToken.ToErrorDto())
			return
		}

		c.Set("claims", claims)
		c.Set("user", claims.User)

		c.Next()
	}
}

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}
