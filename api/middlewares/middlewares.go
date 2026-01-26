// Package middlewares
package middlewares

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func Guard(c *gin.Context) {
	fmt.Println("GUARD")
}
