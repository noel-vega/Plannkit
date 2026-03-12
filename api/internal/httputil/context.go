// Package httputil
package httputil

import "github.com/gin-gonic/gin"

func UserID(c *gin.Context) int {
	return c.MustGet("userID").(int)
}
