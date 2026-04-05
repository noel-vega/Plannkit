package habits

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/noel-vega/habits/api/db"
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

// Habit

type CreateHabitBody struct {
	RoutineID         *int32  `json:"routineId"`
	Name              string  `json:"name"`
	Icon              string  `json:"icon"`
	UnitOfMeasurement string  `json:"unitOfMeasurement"`
	Description       *string `json:"description"`
	CompletionType    string  `json:"completionType"`
	CompletionsPerDay int32   `json:"completionsPerDay"`
}

func (h *Handler) CreateHabit(c *gin.Context) {
	var body CreateHabitBody
	err := c.Bind(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	habit, err := h.service.CreateHabit(c, db.CreateHabitParams{
		UserID:            httputil.UserID(c),
		RoutineID:         body.RoutineID,
		Icon:              body.Icon,
		Name:              body.Name,
		Description:       body.Description,
		CompletionType:    body.CompletionType,
		CompletionsPerDay: body.CompletionsPerDay,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, HabitWithContributions{
		Habit:         habit,
		Contributions: []db.HabitsContribution{},
	})
}

func (h *Handler) GetHabitWithContributions(c *gin.Context) {
	userID := httputil.UserID(c)
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	habit, err := h.service.GetHabitWithContributions(c, db.GetHabitParams{
		ID:     int32(habitID),
		UserID: userID,
	})
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, habit)
}

func (h *Handler) ListHabitsWithContributions(c *gin.Context) {
	habits, err := h.service.ListHabitsWithContributions(c, httputil.UserID(c))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, habits)
}

type UpdateHabitBody struct {
	Name              string  `json:"name"`
	Icon              string  `json:"icon"`
	UnitOfMeasurement *string `json:"unitOfMeasurement"`
	Description       *string `json:"description"`
	CompletionType    string  `json:"completionType"`
	CompletionsPerDay int32   `json:"completionsPerDay"`
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

	err = h.service.UpdateHabit(c, db.UpdateHabitParams{
		ID:                int32(habitID),
		UserID:            httputil.UserID(c),
		Name:              body.Name,
		Description:       body.Description,
		Icon:              body.Icon,
		CompletionType:    body.CompletionType,
		CompletionsPerDay: body.CompletionsPerDay,
	})
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

	err = h.service.DeleteHabit(c, db.DeleteHabitParams{
		ID:     int32(habitID),
		UserID: httputil.UserID(c),
	})
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

// Habit Contributions

type CreateHabitContributionBody struct {
	Completions int32     `json:"completions"`
	Date        time.Time `json:"date"`
}

func (h *Handler) CreateHabitContribution(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("habitID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &CreateHabitContributionBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := db.CreateHabitContributionParams{
		HabitID:     int32(habitID),
		UserID:      httputil.UserID(c),
		Completions: body.Completions,
		Date:        body.Date,
	}

	contrib, err := h.service.CreateContribution(c, params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, contrib)
}

type UpdateCompletionsBody struct {
	Completions int32 `json:"completions"`
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

	params := db.UpdateHabitContributionCompletionsParams{
		ID:          int32(contributionID),
		UserID:      httputil.UserID(c),
		Completions: body.Completions,
	}

	contrib, err := h.service.UpdateContributionCompletions(c, params)
	if err != nil {
		switch {
		case errors.Is(err, ErrContributionNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.JSON(http.StatusOK, contrib)
}

type UpdateHabitPositionBody struct {
	RoutineID      *int32 `json:"routineId"`
	AfterPosition  string `json:"afterPosition"`
	BeforePosition string `json:"beforePosition"`
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

	routine, err := h.service.UpdateHabitPosition(c, UpdateHabitPositionParams{
		ID:             int32(habitID),
		UserID:         httputil.UserID(c),
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

	params := db.DeleteHabitContributionParams{
		ID:     int32(contributionID),
		UserID: httputil.UserID(c),
	}
	err = h.service.DeleteContribution(c, params)
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

// Routine

type CreateRoutineBody struct {
	Name string `json:"name"`
}

func (h *Handler) CreateRoutine(c *gin.Context) {
	body := &CreateRoutineBody{}

	err := c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	routine, err := h.service.CreateRoutine(c, db.CreateRoutineParams{
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
	routines, err := h.service.ListRoutinesWithHabits(c, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, routines)
}

type UpdateRoutineBody struct {
	Name string `json:"name"`
}

func (h *Handler) UpdateRoutine(c *gin.Context) {
	routineID, err := strconv.Atoi(c.Param("routineID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	var body UpdateRoutineBody
	err = c.Bind(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	routine, err := h.service.UpdateRoutine(c, db.UpdateRoutineParams{
		ID:     int32(routineID),
		UserID: httputil.UserID(c),
		Name:   body.Name,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrRoutineNotFound):
			c.AbortWithError(http.StatusNotFound, err)
		case errors.Is(err, ErrValidationNameRequired):
			c.AbortWithError(http.StatusBadRequest, err)
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}
	c.JSON(http.StatusOK, routine)
}

type UpdateRoutinePositionBody struct {
	AfterPosition  string `json:"afterPosition"`
	BeforePosition string `json:"beforePosition"`
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

	routine, err := h.service.UpdateRoutinePosition(c, UpdateRoutinePositionParams{
		ID:             int32(routineID),
		UserID:         httputil.UserID(c),
		AfterPosition:  body.AfterPosition,
		BeforePosition: body.BeforePosition,
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

	c.JSON(http.StatusOK, routine)
}

func (h *Handler) DeleteRoutine(c *gin.Context) {
	routineID, err := strconv.Atoi(c.Param("routineID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = h.service.DeleteRoutine(c, db.DeleteRoutineParams{
		ID:     int32(routineID),
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
