package finances

import (
	"database/sql"
	"errors"
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
		UserID: c.MustGet("userID").(int),
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
	userID := c.MustGet("userID").(int)
	spaces, err := h.service.ListSpaces(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, spaces)
}

func (h *Handler) DeleteSpace(c *gin.Context) {
	userID := c.MustGet("userID").(int)
	spaceID := c.MustGet("spaceID").(int)

	err := h.service.DeleteSpace(userID, spaceID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) CreateGoal(c *gin.Context) {
	data := &CreateGoalParams{
		UserID: c.MustGet("userID").(int),
	}
	err := c.Bind(data)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	goal, err := h.service.CreateGoal(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, goal)
}

func (h *Handler) ListGoals(c *gin.Context) {
	data := &ListGoalsParams{
		UserID:  c.MustGet("userID").(int),
		SpaceID: c.MustGet("spaceID").(int),
	}

	goals, err := h.service.ListGoals(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, goals)
}

func (h *Handler) GetGoal(c *gin.Context) {
	userID := c.MustGet("userID").(int)
	spaceID := c.MustGet("spaceID").(int)

	goalID, err := strconv.Atoi(c.Param("goalID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &GetGoalParams{
		ID:      goalID,
		SpaceID: spaceID,
		UserID:  userID,
	}

	goal, err := h.service.GetGoal(params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, goal)
}

func (h *Handler) CreateExpense(c *gin.Context) {
	userID := c.MustGet("userID").(int)
	spaceID := c.MustGet("spaceID").(int)

	data := &CreateExpenseParams{
		UserID:  userID,
		SpaceID: spaceID,
	}

	err := c.Bind(data)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	expense, err := h.service.CreateExpense(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, expense)
}

func (h *Handler) ListExpenses(c *gin.Context) {
	userID := c.MustGet("userID").(int)
	spaceID := c.MustGet("spaceID").(int)

	data := &ListExpensesParams{
		UserID:  userID,
		SpaceID: spaceID,
	}

	expenses, err := h.service.ListExpenses(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, expenses)
}

func (h *Handler) DeleteExpense(c *gin.Context) {
	userID := c.MustGet("userID").(int)
	spaceID := c.MustGet("spaceID").(int)

	expenseID, err := strconv.Atoi(c.Param("expenseID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteExpenseParams{
		ID:      expenseID,
		SpaceID: spaceID,
		UserID:  userID,
	}
	err = h.service.DeleteExpense(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
