package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var flags = map[string]bool{
	"habits":    true,
	"email":     false,
	"todos":     false,
	"users":     false,
	"documents": false,
	"groceries": false,
	"finances":  false,
	"dashboard": false,
}

func FlagsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, flags)
}
