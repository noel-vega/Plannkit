package finances

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	service *Service
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		service: NewService(db),
	}
}

func (h *Handler) CreateSpace(c *gin.Context) {
	fmt.Println("HOLA CREATE SPACE")
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
func (h *Handler) ListExpenses(c *gin.Context)  {}
