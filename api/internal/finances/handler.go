package finances

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/contracts"
	"github.com/noel-vega/habits/api/internal/httputil"
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
		UserID: httputil.UserID(c),
		Name:   body.Name,
	}

	space, _, err := h.service.CreateSpace(params)
	if err != nil {
		switch {
		case errors.Is(err, ErrValidationRequireName):
			c.AbortWithError(http.StatusBadRequest, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.JSON(http.StatusOK, space)
}

func (h *Handler) ListSpaces(c *gin.Context) {
	userID := httputil.UserID(c)
	spaces, err := h.service.ListSpaces(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, spaces)
}

func (h *Handler) DeleteSpace(c *gin.Context) {
	err := h.service.DeleteSpace(c.MustGet("spaceID").(int))
	if err != nil {
		switch {
		case errors.Is(err, ErrSpaceMemberNotFound):
			c.AbortWithStatus(http.StatusForbidden)
		case errors.Is(err, ErrSpaceNotFound):
			c.AbortWithStatus(http.StatusNotFound)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) UpdateSpaceName(c *gin.Context) {
	body := &UpdateSpaceNameBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	space, err := h.service.UpdateSpaceName(&UpdateSpaceNameParams{
		SpaceMemberRelationship: SpaceMemberRelationship{
			UserID:  httputil.UserID(c),
			SpaceID: c.MustGet("spaceID").(int),
		},
		Name: body.Name,
	})
	if err != nil {
		switch {
		case errors.Is(err, apperrors.ErrUnauthorized):
			c.AbortWithError(http.StatusForbidden, err)
		case errors.Is(err, ErrValidationRequireName), errors.Is(err, ErrValidationMaxCharacters):
			c.AbortWithError(http.StatusBadRequest, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.JSON(http.StatusOK, space)
}

func (h *Handler) CreateGoal(c *gin.Context) {
	body := &CreateGoalBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateGoalParams{
		UserID:            httputil.UserID(c),
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

	params := &GoalIdent{
		ID:      goalID,
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

func (h *Handler) DeleteGoal(c *gin.Context) {
	goalID, err := strconv.Atoi(c.Param("goalID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.DeleteGoal(&GoalIdent{
		ID:      goalID,
		SpaceID: c.MustGet("spaceID").(int),
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrGoalNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
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
		UserID:  httputil.UserID(c),
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
		UserID:  httputil.UserID(c),
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
	contributionID, err := strconv.Atoi(c.Param("contributionID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.DeleteGoalContribution(contributionID)
	if err != nil {
		switch {
		case errors.Is(err, ErrGoalContributionNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
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
		UserID:      httputil.UserID(c),
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
		UserID:  httputil.UserID(c),
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

	err = h.service.DeleteExpense(expenseID)
	if err != nil {
		switch {
		case errors.Is(err, ErrExpenseNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) CreateIncomeSource(c *gin.Context) {
	body := &CreateIncomeSourceBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &InsertIncomeSourceParams{
		SpaceID: c.MustGet("spaceID").(int),
		UserID:  httputil.UserID(c),
		Amount:  body.Amount,
		Name:    body.Name,
	}

	incomeSource, err := h.service.CreateIncomeSource(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, incomeSource)
}

func (h *Handler) ListIncomes(c *gin.Context) {
	params := &ListIncomeSourcesParams{
		SpaceID: c.MustGet("spaceID").(int),
	}
	incomeSources, err := h.service.ListIncomeSources(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, incomeSources)
}

func (h *Handler) DeleteIncome(c *gin.Context) {
	incomeSourceID, err := strconv.Atoi(c.Param("incomeSourceID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = h.service.DeleteIncomeSource(incomeSourceID)
	if err != nil {
		switch {
		case errors.Is(err, ErrIncomeSourceNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) InviteToSpace(c *gin.Context) {
	body := &InviteToSpaceBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	member, err := h.service.InviteToSpace(&InviteToSpaceParams{
		UserID:          httputil.UserID(c),
		NewMemberUserID: body.UserID,
		SpaceID:         c.MustGet("spaceID").(int),
		Role:            body.Role,
	})
	if err != nil {
		switch {
		case errors.Is(err, contracts.ErrNotConnected):
			c.AbortWithError(http.StatusForbidden, err)
		case errors.Is(err, ErrInvalidRole):
			c.AbortWithError(http.StatusBadRequest, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.JSON(http.StatusCreated, member)
}

func (h *Handler) AcceptSpaceInvite(c *gin.Context) {
	spaceID, err := strconv.Atoi(c.Param("spaceID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	member, err := h.service.AcceptSpaceInvite(&SpaceMemberRelationship{
		UserID:  httputil.UserID(c),
		SpaceID: spaceID,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrSpaceMemberNotFound),
			errors.Is(err, ErrSpaceInviteNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		case errors.Is(err, ErrSpaceInviteAlreadyAccepted):
			c.AbortWithError(http.StatusConflict, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.JSON(http.StatusOK, member)
}

func (h *Handler) ListSpaceMembersWithUsers(c *gin.Context) {
	members, err := h.service.ListSpaceMembersWithUsers(&ListSpaceMembersParams{
		SpaceID: c.MustGet("spaceID").(int),
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, members)
}

func (h *Handler) DeleteSpaceMember(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = h.service.DeleteSpaceMember(&SpaceMemberRelationship{
		UserID:  int32(userID),
		SpaceID: c.MustGet("spaceID").(int),
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrSpaceMemberNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		case errors.Is(err, ErrCannotDeleteOwner):
			c.AbortWithError(http.StatusForbidden, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}
