package finances

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/httputil"
)

func VerifySpaceMembership(financeService *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := httputil.UserID(c)
		spaceIDParam := c.Param("spaceID")
		fmt.Println("VerifySpaceMembership hit:", "userID=", userID, "spaceIDParam=", spaceIDParam)
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
				fmt.Println("Forbidden: not a member", "userID=", userID, "spaceID=", spaceID)
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
			fmt.Println("GetSpaceMember error:", err)
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		fmt.Println("Member found:", "status=", member.Status, "role=", member.Role)
		if member.Status != MemberInviteAccepted {
			fmt.Println("Forbidden: still pending", "status=", member.Status)
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
