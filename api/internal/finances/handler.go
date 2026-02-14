package finances

import "github.com/gin-gonic/gin"

type Handler struct{}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) CreateFinanceSpace(c *gin.Context) {}
func (h *Handler) ListFinanceSpaces(c *gin.Context)  {}

func (h *Handler) CreateGoal(c *gin.Context) {}
func (h *Handler) ListGoals(c *gin.Context)  {}

func (h *Handler) CreateExpense(c *gin.Context) {}
func (h *Handler) ListExpenses(c *gin.Context)  {}
