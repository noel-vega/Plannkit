package habit

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	HabitRepo   HabitRepo
	ContribRepo ContributionsRepo
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		HabitRepo:   *NewHabitRepo(db),
		ContribRepo: *NewContributionsRepo(db),
	}
}

func (handler *Handler) GetHabitByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	h, err := handler.HabitRepo.GetByID(id)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	contributions, err := handler.ContribRepo.List(h.ID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	habitWithContributions := HabitWithContributions{
		ID:                h.ID,
		Name:              h.Name,
		Icon:              h.Icon,
		Description:       h.Description,
		CompletionType:    h.CompletionType,
		CompletionsPerDay: h.CompletionsPerDay,
		Contributions:     contributions,
	}
	c.JSON(http.StatusOK, habitWithContributions)
}

func (handler *Handler) ListHabits(c *gin.Context) {
	// Return JSON response
	habitsWithContributions := []HabitWithContributions{}
	habits := handler.HabitRepo.List()
	for _, h := range habits {
		contributions, err := handler.ContribRepo.List(h.ID)
		if err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
		habitsWithContributions = append(habitsWithContributions, HabitWithContributions{
			ID:                h.ID,
			Name:              h.Name,
			Icon:              h.Icon,
			Description:       h.Description,
			CompletionType:    h.CompletionType,
			CompletionsPerDay: h.CompletionsPerDay,
			Contributions:     contributions,
		})
	}
	c.JSON(http.StatusOK, habitsWithContributions)
}

func (handler *Handler) UpdateHabit(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := UpdateHabitParams{ID: id}
	c.Bind(&params)
	err = handler.HabitRepo.Update(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

func (handler *Handler) CreateHabit(c *gin.Context) {
	var data CreateHabitParams
	c.Bind(&data)

	h, err := handler.HabitRepo.Create(data)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, HabitWithContributions{
		ID:                h.ID,
		Name:              h.Name,
		Icon:              h.Icon,
		Description:       h.Description,
		CompletionType:    h.CompletionType,
		CompletionsPerDay: h.CompletionsPerDay,
		Contributions:     []Contribution{},
	})
}

func (handler *Handler) DeleteHabit(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = handler.HabitRepo.Delete(habitID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) CreateHabitContribution(c *gin.Context) {
	habitID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := CreateContributionParams{
		HabitID: habitID,
	}
	c.Bind(&params)

	if err := handler.ContribRepo.Create(params); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

func (handler *Handler) UpdateHabitContribution(c *gin.Context) {
	contributionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := UpdateCompletionsParams{
		ID: contributionID,
	}
	c.Bind(&params)

	if err := handler.ContribRepo.UpdateCompletions(params); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
