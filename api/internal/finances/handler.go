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
	data := &CreateSpaceParams{
		UserID: c.MustGet("user_id").(int),
	}

	err := c.Bind(data)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	space, err := h.service.CreateSpace(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, space)
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

func (h *Handler) DeleteSpace(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	spaceIDParam := c.Param("spaceID")
	spaceID, err := strconv.Atoi(spaceIDParam)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.DeleteSpace(userID, spaceID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
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
