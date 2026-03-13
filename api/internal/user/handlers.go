package user

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/httputil"
)

type Handler struct {
	userService *Service
}

func NewHandler(userService *Service) *Handler {
	return &Handler{
		userService,
	}
}

func (h *Handler) UpdateAvatar(c *gin.Context) {
	userID := httputil.UserID(c)
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	defer file.Close()

	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	ext := filepath.Ext(header.Filename)
	if !allowed[strings.ToLower(ext)] {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	filename, err := h.userService.UpdateAvatar(userID, ext, file)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatar": filename,
	})
}
