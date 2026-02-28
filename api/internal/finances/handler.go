package finances

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/apperrors"
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
	body := &CreateSpaceBody{}

	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateSpaceParams{
		UserID: c.MustGet("userID").(int),
		Name:   body.Name,
	}

	space, err := h.service.CreateSpace(params)
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
	body := &CreateGoalBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateGoalParams{
		UserID:            c.MustGet("userID").(int),
		SpaceID:           c.MustGet("spaceID").(int),
		Name:              body.Name,
		Amount:            body.Amount,
		MonthlyCommitment: body.MonthlyCommitment,
	}

	goal, err := h.service.CreateGoal(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, goal)
}

func (h *Handler) ListGoals(c *gin.Context) {
	params := &ListGoalsParams{
		SpaceID: c.MustGet("spaceID").(int),
	}

	goals, err := h.service.ListGoals(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, goals)
}

func (h *Handler) GetGoal(c *gin.Context) {
	goalID, err := strconv.Atoi(c.Param("goalID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &GetGoalParams{
		GoalID:  goalID,
		SpaceID: c.MustGet("spaceID").(int),
	}

	goal, err := h.service.GetGoal(params)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			c.AbortWithStatus(http.StatusNotFound)
			return
		}
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, goal)
}

func (h *Handler) CreateGoalContribution(c *gin.Context) {
	goalID, err := strconv.Atoi(c.Param("goalID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	body := &CreateGoalContributionBody{}

	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateGoalContributionParams{
		UserID:  c.MustGet("userID").(int),
		SpaceID: c.MustGet("spaceID").(int),
		GoalID:  goalID,
		Amount:  body.Amount,
		Note:    body.Note,
	}

	goal, err := h.service.CreateGoalContribution(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, goal)
}

func (h *Handler) ListGoalContributions(c *gin.Context) {
	goalID, err := strconv.Atoi(c.Param("goalID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	params := &ListGoalContributionsParams{
		UserID:  c.MustGet("userID").(int),
		SpaceID: c.MustGet("spaceID").(int),
		GoalID:  goalID,
	}
	contributions, err := h.service.ListGoalContributions(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, contributions)
}

func (h *Handler) DeleteGoalContribution(c *gin.Context) {
	goalID, err := strconv.Atoi(c.Param("goalID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	contributionID, err := strconv.Atoi(c.Param("contributionID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteGoalContributionParams{
		ID:      contributionID,
		SpaceID: c.MustGet("spaceID").(int),
		GoalID:  goalID,
	}

	err = h.service.DeleteGoalContribution(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) CreateExpense(c *gin.Context) {
	body := &CreateExpenseBody{}

	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateExpenseParams{
		UserID:      c.MustGet("userID").(int),
		SpaceID:     c.MustGet("spaceID").(int),
		Name:        body.Name,
		Amount:      body.Amount,
		Category:    body.Category,
		Description: body.Description,
	}

	expense, err := h.service.CreateExpense(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, expense)
}

func (h *Handler) ListExpenses(c *gin.Context) {
	params := &ListExpensesParams{
		UserID:  c.MustGet("userID").(int),
		SpaceID: c.MustGet("spaceID").(int),
	}

	expenses, err := h.service.ListExpenses(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, expenses)
}

func (h *Handler) DeleteExpense(c *gin.Context) {
	expenseID, err := strconv.Atoi(c.Param("expenseID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteExpenseParams{
		ID:      expenseID,
		SpaceID: c.MustGet("spaceID").(int),
		UserID:  c.MustGet("userID").(int),
	}
	err = h.service.DeleteExpense(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
