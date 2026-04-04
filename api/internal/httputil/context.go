// Package httputil
package httputil

import "github.com/gin-gonic/gin"

func UserID(c *gin.Context) int32 {
	return c.MustGet("userID").(int32)
}
