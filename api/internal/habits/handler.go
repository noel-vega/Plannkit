package habits

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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

func (h *Handler) CreateHabit(c *gin.Context) {
	var body CreateHabitRequestBody
	err := c.Bind(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateHabitParams{
		UserID:            httputil.UserID(c),
		RoutineID:         body.RoutineID,
		Icon:              body.Icon,
		Name:              body.Name,
		Description:       body.Description,
		CompletionType:    body.CompletionType,
		UnitOfMeasurement: body.UnitOfMeasurement,
		CompletionsPerDay: body.CompletionsPerDay,
	}

	habit, err := h.service.CreateHabit(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, HabitWithContributions{
		Habit:         habit,
		Contributions: []HabitContribution{},
	})
}

func (h *Handler) GetHabitWithContributions(c *gin.Context) {
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

	habit, err := h.service.GetHabitWithContributions(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, habit)
}

func (h *Handler) ListHabitsWithContributions(c *gin.Context) {
	habits, err := h.service.ListHabitsWithContributions(httputil.UserID(c))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, habits)
}

func (h *Handler) UpdateHabit(c *gin.Context) {
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
	err = h.service.UpdateHabit(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) DeleteHabit(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteHabitParams{
		ID:     habitID,
		UserID: httputil.UserID(c),
	}

	err = h.service.DeleteHabit(params)
	if err != nil {
		switch {
		case errors.Is(err, ErrHabitNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) CreateHabitContribution(c *gin.Context) {
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

	err = h.service.CreateContribution(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func (h *Handler) UpdateHabitContribution(c *gin.Context) {
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

	if err := h.service.UpdateContributionCompletions(params); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) UpdateHabitPosition(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &UpdateHabitPositionBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	routine, err := h.service.UpdateHabitPosition(&UpdateHabitPositionParams{
		ID:             habitID,
		RoutineID:      body.RoutineID,
		AfterPosition:  body.AfterPosition,
		BeforePosition: body.BeforePosition,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, routine)
}

func (h *Handler) DeleteHabitContribution(c *gin.Context) {
	contributionID, err := strconv.Atoi(c.Param("contributionID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteContributionParams{
		ID:     contributionID,
		UserID: httputil.UserID(c),
	}
	err = h.service.DeleteContribution(params)
	if err != nil {
		switch {
		case errors.Is(err, ErrContributionNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) CreateRoutine(c *gin.Context) {
	body := &CreateRoutineBody{}

	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	routine, err := h.service.CreateRoutine(&InsertRoutineParams{
		UserID: httputil.UserID(c),
		Name:   body.Name,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrValidationNameRequired):
			c.AbortWithError(http.StatusBadRequest, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.JSON(http.StatusCreated, routine)
}

func (h *Handler) ListRoutines(c *gin.Context) {
	userID := httputil.UserID(c)
	routines, err := h.service.ListRoutinesWithHabits(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, routines)
}

func (h *Handler) UpdateRoutinePosition(c *gin.Context) {
	routineID, err := strconv.Atoi(c.Param("routineID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &UpdateRoutinePositionBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	routine, err := h.service.UpdateRoutinePosition(&UpdateRoutinePositionParams{
		ID:             routineID,
		AfterPosition:  body.AfterPosition,
		BeforePosition: body.BeforePosition,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, routine)
}

func (h *Handler) DeleteRoutine(c *gin.Context) {
	routineID, err := strconv.Atoi(c.Param("routineID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = h.service.DeleteRoutine(&DeleteRoutineParams{
		ID:     routineID,
		UserID: httputil.UserID(c),
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrRoutineNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusNoContent)
}
