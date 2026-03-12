package finances

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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
		member, err := financeService.GetSpaceMember(&SpaceMemberRelationship{
			UserID:  userID,
			SpaceID: spaceID,
		})
		if err != nil {
			if errors.Is(err, ErrSpaceMemberNotFound) {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if member.Status != "accepted" {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Set("spaceID", spaceID)
		c.Next()
	}
}
