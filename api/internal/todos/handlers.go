package todos

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type Handler struct {
	repository *Repository
}

func NewHandler(db *sqlx.DB) *Handler {
	return &Handler{
		repository: NewRepository(db),
	}
}

func (handler *Handler) CreateTodo(c *gin.Context) {
	userID := c.MustGet("userID").(int)

	body := &CreateTodoBody{}
	err := c.Bind(&body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &CreateTodoParams{
		UserID:      userID,
		Name:        body.Name,
		Description: body.Description,
		Status:      body.Status,
		Position:    body.Position,
	}
	err = handler.repository.Create(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) ListTodos(c *gin.Context) {
	todos, err := handler.repository.List(c.MustGet("userID").(int))
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, todos)
}

func (handler *Handler) GetTodosBoard(c *gin.Context) {
	t, err := handler.repository.List(c.MustGet("userID").(int))
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

func (handler *Handler) UpdateTodoPosition(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("todoID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	body := &UpdatePositionBody{}
	err = c.Bind(body)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &UpdatePositionParams{
		ID:             id,
		UserID:         c.MustGet("userID").(int),
		Status:         body.Status,
		AfterPosition:  body.AfterPosition,
		BeforePosition: body.BeforePosition,
	}
	err = handler.repository.UpdatePosition(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}

func (handler *Handler) DeleteTodo(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("todoID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &DeleteTodoParams{
		ID:     id,
		UserID: c.MustGet("userID").(int),
	}
	err = handler.repository.Delete(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (handler *Handler) GetTodo(c *gin.Context) {
	todoID, err := strconv.Atoi(c.Param("todoID"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	params := &GetTodoParams{
		ID:     todoID,
		UserID: c.MustGet("userID").(int),
	}
	todo, err := handler.repository.GetTodo(params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, todo)
}
