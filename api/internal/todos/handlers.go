package todos

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	TodosRepo *TodosRepo
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		TodosRepo: NewTodosRepo(db),
	}
}

func (handler *Handler) ListTodos(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	todos, err := handler.TodosRepo.List(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, todos)
}

func (handler *Handler) GetTodosBoard(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	t, err := handler.TodosRepo.List(userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	board := map[string][]Todo{}

	for _, todo := range t {
		statusTodos, exists := board[todo.Status]
		if !exists {
			board[todo.Status] = []Todo{todo}
		} else {
			board[todo.Status] = append(statusTodos, todo)
		}
	}
	c.JSON(http.StatusOK, board)
}

func (handler *Handler) CreateTodo(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	todo := &CreateTodoParams{
		UserID: userID,
	}
	err := c.Bind(&todo)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = handler.TodosRepo.Create(todo)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) UpdateTodoPosition(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	params := UpdatePositionParams{
		ID:     id,
		UserID: userID,
	}
	c.Bind(&params)

	err = handler.TodosRepo.UpdatePosition(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) DeleteTodo(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	err = handler.TodosRepo.Delete(id, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (handler *Handler) GetTodoByID(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	todo, err := handler.TodosRepo.GetByID(id, userID)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, todo)
}
