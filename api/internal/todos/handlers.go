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
	todos, err := handler.TodosRepo.List()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, todos)
}

func (handler *Handler) GetTodosBoard(c *gin.Context) {
	t, err := handler.TodosRepo.List()
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
	var todo CreateTodoParams
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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	params := UpdatePositionParams{
		ID: id,
	}
	c.Bind(&params)

	err = handler.TodosRepo.UpdatePosition(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
