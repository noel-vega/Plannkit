package finances

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) CreateSpace(c *gin.Context) {
}

func (h *Handler) ListSpaces(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	spaces, err := h.service.ListSpaces(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, spaces)
}

func (h *Handler) CreateGoal(c *gin.Context) {}
func (h *Handler) ListGoals(c *gin.Context)  {}

func (h *Handler) CreateExpense(c *gin.Context) {}

func (h *Handler) ListExpenses(c *gin.Context) {
	userID := c.MustGet("user_id").(int)

	spaceID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	expenses, err := h.service.ListExpenses(userID, spaceID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, expenses)
}
