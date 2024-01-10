package middleware

import (
	"digital-test-vm/be/internal/utils/logger"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		endTime := time.Now()
		latencyTime := endTime.Sub(start)
		reqMethod := c.Request.Method
		reqUri := c.Request.RequestURI
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()

		param := map[string]interface{}{
			"method":  reqMethod,
			"latency": latencyTime,
			"uri":     reqUri,
			"status":  statusCode,
			"ip":      clientIP,
		}

		log := logger.NewLogger()

		if len(c.Errors) == 0 {
			log.Info(param)
		} else {
			errList := []error{}
			for _, err := range c.Errors {
				errList = append(errList, err)
			}

			if len(errList) > 0 {
				param["errors"] = errList
				log.Error(param)
			}
		}

		c.Next()

	}
}
