package server

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/noel-vega/habits/api/internal/auth"
)

func Authentication(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		refreshTokenStr, err := c.Cookie("refresh_token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
			return
		}

		refreshTokenClaims, err := authService.ValidateToken(refreshTokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token: " + err.Error()})
			return
		}

		accessTokenStr := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		accessTokenClaims, err := authService.ValidateToken(accessTokenStr)
		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				newAccessToken, err := authService.GenerateAccessToken(refreshTokenClaims.UserID)
				if err != nil {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token: " + err.Error()})
					return
				}
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"newAccessToken": newAccessToken,
				})
				return
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token: " + err.Error()})
			return
		}

		c.Set("userID", accessTokenClaims.UserID)
		c.Next()
	}
}
