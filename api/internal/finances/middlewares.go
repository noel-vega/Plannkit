package finances

import (
	"errors"
	"net/http"
	"slices"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/db"
	"github.com/noel-vega/habits/api/internal/httputil"
)

func VerifySpaceMembership(financeService *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := httputil.UserID(c)
		spaceIDParam := c.Param("spaceID")
		spaceID, err := strconv.Atoi(spaceIDParam)
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		member, err := financeService.GetSpaceMember(c, db.GetSpaceMemberParams{
			UserID:         userID,
			FinanceSpaceID: int32(spaceID),
		})
		if err != nil {
			if errors.Is(err, ErrSpaceMemberNotFound) {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if member.Status != MemberInviteAccepted {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Set("spaceID", spaceID)
		c.Set("spaceRole", member.Role)
		c.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.MustGet("spaceRole").(string)
		if !slices.Contains(roles, role) {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	}
}
