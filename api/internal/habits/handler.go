package habits

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/internal/httputil"
)

type Handler struct {
	habitsService *Service
}

func NewHandler(habitsService *Service) *Handler {
	return &Handler{
		habitsService: habitsService,
	}
}

func (handler *Handler) CreateHabit(c *gin.Context) {
	body := &CreateHabitBody{}
	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateHabitParams{
		UserID:            httputil.UserID(c),
		Icon:              body.Icon,
		Name:              body.Name,
		Description:       body.Description,
		CompletionType:    body.CompletionType,
		UnitOfMeasurement: body.UnitOfMeasurement,
		CompletionsPerDay: body.CompletionsPerDay,
	}

	h, err := handler.habitsService.CreateHabit(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, HabitWithContributions{
		ID:                h.ID,
		Name:              h.Name,
		Icon:              h.Icon,
		Description:       h.Description,
		CompletionType:    h.CompletionType,
		CompletionsPerDay: h.CompletionsPerDay,
		Contributions:     []HabitContribution{},
	})
}

func (handler *Handler) GetHabitWithContributions(c *gin.Context) {
	userID := httputil.UserID(c)
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &GetHabitParams{
		ID:     habitID,
		UserID: userID,
	}

	habit, err := handler.habitsService.GetHabitWithContributions(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, habit)
}

func (handler *Handler) ListHabitsWithContributions(c *gin.Context) {
	habits, err := handler.habitsService.ListHabitsWithContributions(httputil.UserID(c))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, habits)
}

func (handler *Handler) UpdateHabit(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &UpdateHabitBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &UpdateHabitParams{
		ID:                habitID,
		UserID:            httputil.UserID(c),
		Name:              body.Name,
		Description:       body.Description,
		Icon:              body.Icon,
		UnitOfMeasurement: body.UnitOfMeasurement,
		CompletionType:    body.CompletionType,
		CompletionsPerDay: body.CompletionsPerDay,
	}
	err = handler.habitsService.UpdateHabit(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
	}

	c.Status(http.StatusNoContent)
}

func (handler *Handler) DeleteHabit(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteHabitParams{
		ID:     habitID,
		UserID: httputil.UserID(c),
	}

	err = handler.habitsService.DeleteHabit(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (handler *Handler) CreateHabitContribution(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &CreateContributionBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateContributionParams{
		HabitID:     habitID,
		UserID:      httputil.UserID(c),
		Completions: body.Completions,
		Date:        body.Date,
	}

	err = handler.habitsService.CreateContribution(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func (handler *Handler) UpdateHabitContribution(c *gin.Context) {
	contributionID, err := strconv.Atoi(c.Param("contributionID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &UpdateCompletionsBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &UpdateContributionCompletionsParams{
		ID:          contributionID,
		UserID:      httputil.UserID(c),
		Completions: body.Completions,
	}

	if err := handler.habitsService.UpdateContributionCompletions(params); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (handler *Handler) DeleteHabitContribution(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	contributionID, err := strconv.Atoi(c.Param("contributionID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteContributionParams{
		ID:      contributionID,
		HabitID: habitID,
		UserID:  httputil.UserID(c),
	}
	err = handler.habitsService.DeleteContribution(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}
