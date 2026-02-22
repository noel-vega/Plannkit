// Package middlewares
package main

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/noel-vega/habits/api/internal/auth"
	"github.com/noel-vega/habits/api/internal/finances"
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
				newAccessToken, err := authService.GenerateToken(refreshTokenClaims.UserID, 1*time.Minute)
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

func VerifySpaceMembership(financeService *finances.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(int)
		spaceIDParam := c.Param("spaceID")
		spaceID, err := strconv.Atoi(spaceIDParam)
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		exists, err := financeService.SpaceMembershipExists(userID, spaceID)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if !exists {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Set("spaceID", spaceID)
		c.Next()
	}
}
