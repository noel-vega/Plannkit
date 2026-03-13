package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthenticateUser(authService *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")

		if !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		accessToken := strings.TrimPrefix(header, "Bearer ")
		accessTokenClaims, err := authService.ValidateToken(accessToken)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("userID", accessTokenClaims.UserID)
		c.Next()
	}
}
