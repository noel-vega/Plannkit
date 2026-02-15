package habits

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
	userID := c.MustGet("user_id").(int)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	h, err := handler.HabitRepo.GetByHabitID(id, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	contributions, err := handler.ContribRepo.List(h.ID, userID)
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
	userID := c.MustGet("user_id").(int)
	habitsWithContributions := []HabitWithContributions{}
	habits, err := handler.HabitRepo.ListHabits(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	for _, h := range habits {
		contributions, err := handler.ContribRepo.List(h.ID, userID)
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
	err = handler.HabitRepo.UpdateHabit(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

func (handler *Handler) CreateHabit(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	data := CreateHabitParams{
		UserID: userID,
	}
	c.Bind(&data)

	h, err := handler.HabitRepo.CreateHabit(data)
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
	userID := c.MustGet("user_id").(int)
	habitID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = handler.HabitRepo.DeleteHabit(habitID, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) CreateHabitContribution(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	habitID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := CreateContributionParams{
		HabitID: habitID,
		UserID:  userID,
	}
	c.Bind(&params)

	if err := handler.ContribRepo.Create(params); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

func (handler *Handler) UpdateHabitContribution(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	contributionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := UpdateCompletionsParams{
		ID:     contributionID,
		UserID: userID,
	}
	c.Bind(&params)

	if err := handler.ContribRepo.UpdateCompletions(params); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) DeleteHabitContribution(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	contributionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = handler.ContribRepo.Delete(contributionID, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
