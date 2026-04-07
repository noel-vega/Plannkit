package finances

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/db"
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

	space, _, err := h.service.CreateSpace(c, CreateSpaceParams{
		UserID: httputil.UserID(c),
		Name:   body.Name,
	})
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
	spaces, err := h.service.ListSpaces(c, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, spaces)
}

func (h *Handler) DeleteSpace(c *gin.Context) {
	err := h.service.DeleteSpace(c, c.MustGet("spaceID").(int32))
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

	err = h.service.UpdateSpaceName(c, httputil.UserID(c), db.UpdateSpaceNameParams{
		ID:   c.MustGet("spaceID").(int32),
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
	c.Status(http.StatusNoContent)
}

func (h *Handler) CreateGoal(c *gin.Context) {
	body := &CreateGoalBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	goal, err := h.service.CreateGoal(c, db.CreateGoalParams{
		UserID:            httputil.UserID(c),
		FinanceSpaceID:    c.MustGet("spaceID").(int32),
		Name:              body.Name,
		Amount:            body.Amount,
		MonthlyCommitment: body.MonthlyCommitment,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, goal)
}

func (h *Handler) ListGoals(c *gin.Context) {
	spaceID := c.MustGet("spaceID").(int32)
	goals, err := h.service.ListGoals(c, spaceID)
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

	goal, err := h.service.GetGoal(c, db.GetGoalParams{
		ID:             int32(goalID),
		FinanceSpaceID: c.MustGet("spaceID").(int32),
	})
	if err != nil {
		if errors.Is(err, ErrGoalNotFound) {
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

	err = h.service.DeleteGoal(c, db.DeleteGoalParams{
		ID:             int32(goalID),
		FinanceSpaceID: c.MustGet("spaceID").(int32),
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

	goal, err := h.service.CreateGoalContribution(c, db.CreateGoalContributionParams{
		UserID:             httputil.UserID(c),
		FinanceSpaceID:     c.MustGet("spaceID").(int32),
		FinanceSpaceGoalID: int32(goalID),
		Amount:             body.Amount,
		Note:               body.Note,
	})
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
	contributions, err := h.service.ListGoalContributions(c, db.ListGoalContributionsParams{
		UserID:             httputil.UserID(c),
		FinanceSpaceID:     c.MustGet("spaceID").(int32),
		FinanceSpaceGoalID: int32(goalID),
	})
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

	err = h.service.DeleteGoalContribution(c, int32(contributionID))
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

	expense, err := h.service.CreateExpense(c, db.CreateExpenseParams{
		UserID:         httputil.UserID(c),
		FinanceSpaceID: c.MustGet("spaceID").(int32),
		Name:           body.Name,
		Amount:         body.Amount,
		Category:       body.Category,
		Description:    body.Description,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, expense)
}

func (h *Handler) ListExpenses(c *gin.Context) {
	expenses, err := h.service.ListExpenses(c, db.ListExpensesParams{
		UserID:         httputil.UserID(c),
		FinanceSpaceID: c.MustGet("spaceID").(int32),
	})
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

	err = h.service.DeleteExpense(c, int32(expenseID))
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

	incomeSource, err := h.service.CreateIncomeSource(c, db.CreateIncomeSourceParams{
		FinanceSpaceID: c.MustGet("spaceID").(int32),
		UserID:         httputil.UserID(c),
		Amount:         body.Amount,
		Name:           body.Name,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, incomeSource)
}

func (h *Handler) ListIncomes(c *gin.Context) {
	spaceID := c.MustGet("spaceID").(int32)
	incomeSources, err := h.service.ListIncomeSources(c, spaceID)
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

	err = h.service.DeleteIncomeSource(c, int32(incomeSourceID))
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

	member, err := h.service.InviteToSpace(c, InviteToSpaceParams{
		UserID:          httputil.UserID(c),
		NewMemberUserID: body.UserID,
		SpaceID:         c.MustGet("spaceID").(int32),
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
	err = h.service.AcceptSpaceInvite(c, AcceptSpaceInvite{
		UserID:  httputil.UserID(c),
		SpaceID: int32(spaceID),
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
	c.Status(http.StatusNoContent)
}

func (h *Handler) ListSpaceMembersWithUsers(c *gin.Context) {
	members, err := h.service.ListSpaceMembersWithUsers(c, c.MustGet("spaceID").(int32))
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
	err = h.service.DeleteSpaceMember(c, db.DeleteSpaceMemberParams{
		UserID:         int32(userID),
		FinanceSpaceID: c.MustGet("spaceID").(int32),
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
