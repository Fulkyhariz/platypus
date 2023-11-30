package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type PingHandler struct {
}

func (p *PingHandler) PingHandler(c *gin.Context) {
	c.JSON(http.StatusOK, "pong")
}

func NewPingHandler() *PingHandler {
	return &PingHandler{}
}
