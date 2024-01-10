package middleware

import (
	"digital-test-vm/be/internal/shared"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GlobalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		err := c.Errors.Last()
		if err != nil {
			switch e := err.Err.(type) {
			case *shared.HTTPError:
				c.AbortWithStatusJSON(e.StatusCode, e.ToErrorDto())
			default:
				c.AbortWithStatusJSON(http.StatusInternalServerError, shared.ErrorDto{
					Message: "internal server error",
				})
			}
			c.Abort()
		}
	}
}
